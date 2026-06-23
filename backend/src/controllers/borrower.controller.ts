import { Request, Response } from "express";
import { BorrowerService } from "../services/borrower.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

interface BorrowerQuery {
  search?: string;
  crop?: string;
  state?: string;
  tier?: string;
  page?: string;
  limit?: string;
}

export const getBorrowers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden("Lender access required");
  const query = req.query as BorrowerQuery;
  const result = await BorrowerService.getAll(req.user.lenderId, query);
  res.json({ success: true, ...result });
});

export const getBorrower = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw ApiError.badRequest("Borrower ID is required");

  // Authorization check: Lenders can only view borrowers who have loans with their programs
  if (req.user?.lenderId) {
    const borrower = await BorrowerService.getByIdForLender(id, req.user.lenderId);
    res.json({ success: true, data: borrower });
  } else if (req.user?.role === "SUPER_ADMIN") {
    // Super admins can view any borrower
    const borrower = await BorrowerService.getById(id);
    res.json({ success: true, data: borrower });
  } else {
    throw ApiError.forbidden("Access denied");
  }
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.sub) throw ApiError.unauthorized();
  const profile = await BorrowerService.getMyProfile(req.user.sub);
  res.json({ success: true, data: profile });
});
