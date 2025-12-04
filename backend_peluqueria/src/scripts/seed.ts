import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Usuario, Negocio, Servicio } from '../models';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Conectar a MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar colecciones existentes (opcional - comentar si no quieres limpiar)
    console.log('🗑️  Limpiando colecciones existentes...');
    await Usuario.deleteMany({});
    await Negocio.deleteMany({});
    await Servicio.deleteMany({});
    console.log('✅ Colecciones limpiadas');

    // 1. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const adminUser = await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@peluqueria.com',
      telefono: '+51 900 111 222',
      contrasena: 'Admin123!', // Será hasheada automáticamente
      rol: 'admin',
      activo: true,
    });
    console.log('✅ Usuario administrador creado:', adminUser.email);

    // 2. Crear configuración del negocio
    console.log('🏢 Creando configuración del negocio...');
    const negocio = await Negocio.create({
      _id: 'configuracion',
      nombre: 'Peluquería VIP',
      direccion: 'Av. Central 456, Lima, Perú',
      telefono: '+51 900 111 222',
      email: 'contacto@peluqueriavip.com',
      horarioOperacion: {
        lunes: { apertura: '09:00', cierre: '19:00', cerrado: false },
        martes: { apertura: '09:00', cierre: '19:00', cerrado: false },
        miercoles: { apertura: '09:00', cierre: '19:00', cerrado: false },
        jueves: { apertura: '09:00', cierre: '19:00', cerrado: false },
        viernes: { apertura: '09:00', cierre: '19:00', cerrado: false },
        sabado: { apertura: '09:00', cierre: '14:00', cerrado: false },
        domingo: { apertura: '00:00', cierre: '00:00', cerrado: true },
      },
      tiempoBufferMinutos: 15,
    });
    console.log('✅ Configuración del negocio creada:', negocio.nombre);

    // 3. Crear servicios de ejemplo
    console.log('💇 Creando servicios de ejemplo...');
    const servicios = await Servicio.insertMany([
      {
        nombre: 'Corte de Caballero',
        descripcion: 'Corte clásico con máquina y tijera',
        precio: 25.00,
        duracionMinutos: 30,
        categoria: 'Cabello',
        estado: 'activo',
      },
      {
        nombre: 'Corte de Dama',
        descripcion: 'Corte con tijera y peinado',
        precio: 35.00,
        duracionMinutos: 45,
        categoria: 'Cabello',
        estado: 'activo',
      },
      {
        nombre: 'Tinte Completo',
        descripcion: 'Tinte de cabello completo con productos de calidad',
        precio: 80.00,
        duracionMinutos: 120,
        categoria: 'Color',
        estado: 'activo',
      },
      {
        nombre: 'Mechas',
        descripcion: 'Mechas californianas o balayage',
        precio: 120.00,
        duracionMinutos: 180,
        categoria: 'Color',
        estado: 'activo',
      },
      {
        nombre: 'Barba y Bigote',
        descripcion: 'Arreglo de barba y bigote con navaja',
        precio: 15.00,
        duracionMinutos: 20,
        categoria: 'Barba',
        estado: 'activo',
      },
      {
        nombre: 'Tratamiento Capilar',
        descripcion: 'Tratamiento hidratante y reparador',
        precio: 50.00,
        duracionMinutos: 60,
        categoria: 'Tratamientos',
        estado: 'activo',
      },
    ]);
    console.log(`✅ ${servicios.length} servicios creados`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - Admin: ${adminUser.email} / Admin123!`);
    console.log(`   - Negocio: ${negocio.nombre}`);
    console.log(`   - Servicios: ${servicios.length}`);
    console.log('\n💡 Puedes iniciar sesión con las credenciales del admin');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar seed
seedDatabase();
