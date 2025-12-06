import { Types } from 'mongoose';
import { Negocio, Peluquero, Cita, Ausencia, Servicio } from '../models';

interface TimeSlot {
  inicio: string; // HH:mm format
  fin: string; // HH:mm format
}

interface AvailabilityParams {
  peluqueroId: string;
  fecha: Date;
  servicioId: string;
}

/**
 * Get operational hours for a specific date
 */
export const getOperationalHours = async (fecha: Date): Promise<{ apertura: string; cierre: string; cerrado: boolean } | null> => {
  const negocio = await Negocio.findById('configuracion');
  if (!negocio) {
    throw new Error('Configuración del negocio no encontrada');
  }

  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaSemana = diasSemana[fecha.getDay()] as keyof typeof negocio.horarioOperacion;
  
  const horario = negocio.horarioOperacion[diaSemana];
  
  if (horario.cerrado) {
    return null;
  }

  return {
    apertura: horario.apertura,
    cierre: horario.cierre,
    cerrado: false,
  };
};

/**
 * Get hairstylist's existing appointments for a date
 */
export const getHairstylistAppointments = async (peluqueroId: string, fecha: Date): Promise<{ inicio: Date; fin: Date }[]> => {
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  const citas = await Cita.find({
    peluqueroId: new Types.ObjectId(peluqueroId),
    fechaHoraInicio: { $gte: startOfDay, $lte: endOfDay },
    estado: { $in: ['Confirmada', 'Pendiente'] },
  }).select('fechaHoraInicio fechaHoraFin');

  return citas.map(cita => ({
    inicio: cita.fechaHoraInicio,
    fin: cita.fechaHoraFin,
  }));
};

/**
 * Get hairstylist's absences
 */
export const getHairstylistAbsences = async (peluqueroId: string, fecha: Date): Promise<{ inicio: Date; fin: Date }[]> => {
  const ausencias = await Ausencia.find({
    peluqueroId: new Types.ObjectId(peluqueroId),
    fechaInicio: { $lte: fecha },
    fechaFin: { $gte: fecha },
  }).select('fechaInicio fechaFin');

  return ausencias.map(ausencia => ({
    inicio: ausencia.fechaInicio,
    fin: ausencia.fechaFin,
  }));
};

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Convert Date to minutes since midnight
 */
const dateToMinutes = (date: Date): number => {
  return date.getHours() * 60 + date.getMinutes();
};

/**
 * Check if a time slot overlaps with any blocked periods
 */
const hasOverlap = (
  slotStart: number,
  slotEnd: number,
  blockedPeriods: { start: number; end: number }[]
): boolean => {
  return blockedPeriods.some(period => {
    return slotStart < period.end && slotEnd > period.start;
  });
};

/**
 * Calculate available time slots for a hairstylist on a specific date
 */
export const calculateAvailableSlots = async (params: AvailabilityParams): Promise<TimeSlot[]> => {
  const { peluqueroId, fecha, servicioId } = params;

  // 1. Get operational hours
  const operationalHours = await getOperationalHours(fecha);
  if (!operationalHours || operationalHours.cerrado) {
    return []; // Business is closed on this day
  }

  // 2. Get service duration and buffer time
  const servicio = await Servicio.findById(servicioId);
  if (!servicio) {
    throw new Error('Servicio no encontrado');
  }

  const negocio = await Negocio.findById('configuracion');
  if (!negocio) {
    throw new Error('Configuración del negocio no encontrada');
  }

  const serviceDuration = servicio.duracionMinutos;
  const bufferTime = negocio.tiempoBufferMinutos;
  const totalDuration = serviceDuration + bufferTime;

  // 3. Get hairstylist's appointments and absences
  const appointments = await getHairstylistAppointments(peluqueroId, fecha);
  const absences = await getHairstylistAbsences(peluqueroId, fecha);

  // 4. Convert operational hours to minutes
  const openingMinutes = timeToMinutes(operationalHours.apertura);
  const closingMinutes = timeToMinutes(operationalHours.cierre);

  // 5. Build blocked periods (appointments + absences)
  const blockedPeriods: { start: number; end: number }[] = [];

  // Add appointments
  appointments.forEach(apt => {
    blockedPeriods.push({
      start: dateToMinutes(apt.inicio),
      end: dateToMinutes(apt.fin),
    });
  });

  // Add absences (full day if absence covers this date)
  if (absences.length > 0) {
    // If there's an absence, block the entire day
    return [];
  }

  // 6. Generate possible time slots
  // Slots are spaced by totalDuration (service + buffer) but only show service duration to client
  const availableSlots: TimeSlot[] = [];

  for (let startMinutes = openingMinutes; startMinutes + totalDuration <= closingMinutes; startMinutes += totalDuration) {
    const endMinutes = startMinutes + totalDuration;

    // Check if this slot overlaps with any blocked period
    if (!hasOverlap(startMinutes, endMinutes, blockedPeriods)) {
      availableSlots.push({
        inicio: minutesToTime(startMinutes),
        fin: minutesToTime(startMinutes + serviceDuration), // Only show service duration, not buffer
      });
    }
  }

  return availableSlots;
};

/**
 * Check if a specific time slot is available
 */
export const isSlotAvailable = async (
  peluqueroId: string,
  fecha: Date,
  horaInicio: string,
  servicioId: string
): Promise<boolean> => {
  const availableSlots = await calculateAvailableSlots({
    peluqueroId,
    fecha,
    servicioId,
  });

  return availableSlots.some(slot => slot.inicio === horaInicio);
};
