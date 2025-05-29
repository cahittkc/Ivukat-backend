import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { successResponse, errorResponse } from './utils/responseHandler';
import { ApiError } from './utils/ApiError';
import { AppDataSource } from './config/db';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import caseTypeRoutes from './routes/CaseTypeRoutes';
import caseRoutes from './routes/CaseRoutes';

const app: Express = express();
const port = process.env.PORT || 3000;

// Initialize TypeORM
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    });

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




// Routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/case-types', caseTypeRoutes);
app.use('/api/cases', caseRoutes);

// Test route
const homeHandler: RequestHandler = (_req, res) => {
    successResponse(res, { message: 'Ivukat Backend API is running!' });
};
app.get('/', homeHandler);

// Database test route
const dbTestHandler: RequestHandler = async (_req, res, next) => {
    try {
        const result = await AppDataSource.query('SELECT NOW()');
        successResponse(
            res,
            { timestamp: result[0].now },
            'Database connection successful!'
        );
    } catch (error: any) {
        next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Database connection failed: ' + error.message));
    }
};
app.get('/db-ivukat-v1', dbTestHandler);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({ status: 'ok' });
});

// 404 handler - should be after all routes
const notFoundHandler: RequestHandler = (_req, res) => {
    errorResponse(res, 'Route not found', StatusCodes.NOT_FOUND);
};
app.use(notFoundHandler);

// Global error handler - should be the last middleware
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    errorHandler(err, req, res, next);
};
app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 