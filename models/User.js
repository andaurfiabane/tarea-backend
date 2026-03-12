import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder 100 caracteres"]
  },

  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Formato de email inválido"]
  },

  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    select: false
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

   isDeleted: { 
    type: Boolean, 
    default: false 
  }

},
{
  timestamps: true,
  versionKey: false
}
);

// Middleware que se ejecuta antes de cualquier consulta "find".
// Implementa soft delete: si la consulta no especifica isDeleted
// ni usa la opción bypassDeleted, se filtran automáticamente
// los documentos con isDeleted = true.
userSchema.pre(/^find/, function () {

  const query = this.getQuery();
  const options = this.getOptions();

  if (!query.hasOwnProperty("isDeleted") && !options.bypassDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

});

export default mongoose.model("User", userSchema);