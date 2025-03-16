import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import transactionsRouter from './routes/transactions';
import cookieParser from 'cookie-parser';

// import * as middlewares from './middlewares';
// import api from './api';

require('dotenv').config();

const app = express();
// https://github.com/websockets/ws/issues/1810
// app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/api", transactionsRouter);
app.use("/user", userRouter);

// app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);

export default app;
