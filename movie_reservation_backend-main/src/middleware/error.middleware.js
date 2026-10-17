const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Prisma unique constraint (e.g. duplicate email)
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate value for a unique field';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;