import prisma from "../db.js";

export async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const user = await prisma.userCredentials.findUnique({
      where: { userId },
      select: {
        userRole: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        error: "Deleted user cannot access admin panel",
      });
    }

    if (user.userRole !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Admin authorization error",
    });
  }
}