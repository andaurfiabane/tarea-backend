export const errorHandler = (err, req, res, next) => {

  const status = err.status || 500;

  console.error(`${status} - ${err.message}`);

  res.status(status).json({
    error: err.message || "Error interno del servidor"
  });

};