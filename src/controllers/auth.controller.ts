import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z, { success } from "zod";
import { error } from "node:console";
import { HttpError } from "../errors/http-error";
let userService = new UserService();
export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body); // validate request body
      if (!parsedData.success) {
        // validation failed
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);
      console.log(
        ` New user registered: ${newUser.email} (role: ${newUser.role})`,
      );

      return res
        .status(201)
        .json({ success: true, message: "User Created", data: newUser });
    } catch (error: Error | any) {
      // exception handling
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const loginData: LoginUserDTO = parsedData.data;
      const { token, user } = await userService.loginUser(loginData);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
        token,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserbyId(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const user = await userService.getUserbyId(userId);
      return res.status(200).json({
        success: true,
        message: "user fetched successfully",
        data: user,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id; // from middlware
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID not provided" });
      }
      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      if (req.file) {
        // if new image uploaded through multer
        parsedData.data.image = `/uploads/${req.file.filename}`;
      }
      const updatedUser = await userService.updateUser(userId, parsedData.data);
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async requestPasswordChange(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      await userService.sendResetPasswordEmail(email);

      return res.status(200).json({
        success: true,
        message: "Password reset code sent to email",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async deleteMe(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const password = req.body?.password;
      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }

      await userService.deleteMe(userId, password);

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  //reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and reset code are required",
        });
      }

      // reuse UpdateUserDTO just to validate password
      const parsed = UpdateUserDTO.pick({
        password: true,
      }).safeParse({ password: newPassword });

      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }

      await userService.resetPassword(email, code, newPassword);

      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
