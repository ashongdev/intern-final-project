import { Response } from "express";

export const handleSuccess = (res: Response, message: string, data?: any) => {
	return res.status(200).json({ success: true, message, data });
};

export const handleError = (
	res: Response,
	message: string,
	errors?: any,
	statusCode = 400
) => {
	return res.status(statusCode).json({ success: false, message, errors });
};
