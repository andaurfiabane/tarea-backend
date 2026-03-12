import mongoose from "mongoose";

const consoleSchema = new mongoose.Schema(
{
  nombre: { 
    type: String, 
    required: [true, 'El nombre de la consola es obligatorio'], 
    trim: true
  },

  fabricante: { 
    type: String, 
    required: [true, 'El fabricante de la consola es obligatorio'],
    trim: true
  },

  añoLanzamiento: { 
    type: Number, 
    min: [1970, 'El año de lanzamiento no puede ser anterior a 1970'], 
    max: [new Date().getFullYear(), 'El año de lanzamiento no puede ser futuro']
  },

  isDeleted: { 
    type: Boolean, 
    default: false 
  }

},
{
  timestamps: true,
  versionKey: false
});

// Middleware que se ejecuta antes de cualquier consulta "find".
// Implementa soft delete: si la consulta no especifica isDeleted
// ni usa la opción bypassDeleted, se filtran automáticamente
// los documentos con isDeleted = true.
consoleSchema.pre(/^find/, function () {

  const query = this.getQuery();
  const options = this.getOptions();

  if (!query.hasOwnProperty("isDeleted") && !(options?.bypassDeleted)) {
    this.where({ isDeleted: { $ne: true } });
  }

});

export default mongoose.model("Console", consoleSchema);