import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    genero: {
      type: String,
      required: true,
      trim: true
    },
    precioEstimado: {
      type: Number,
      required: true,
      min: 0
    },
    console: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Console",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Middleware que se ejecuta antes de cualquier consulta "find".
// Implementa soft delete: si la consulta no especifica isDeleted
// ni usa la opción bypassDeleted, se filtran automáticamente
// los documentos con isDeleted = true.
gameSchema.pre(/^find/, function () {

  const query = this.getQuery();
  const options = this.getOptions();

  if (!query.hasOwnProperty("isDeleted") && !options.bypassDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

});

export default mongoose.model("Game", gameSchema);