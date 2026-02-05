import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import bcrypt from "bcryptjs";

let userRepository = new UserRepository();
type Creator = {
  id: string;
  role?: "admin" | "user" | "driver";
};

export class UserService {
  async createUser(data: CreateUserDTO, createdBy?: Creator) {
    // business logic before creating user
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    // hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
    data.password = hashedPassword;

    const role =
      createdBy?.role === "admin"
        ? (data.role ?? "user") // admin can choose, default user
        : "user";
    // create user
    const payload = {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      role,
      // imageUrl: data.imageUrl ?? undefined, // if you have it
    };
    const newUser = await userRepository.createUser(payload);
    return newUser;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    // compare password
    const validPassword = await bcryptjs.compare(data.password, user.password);
    // plaintext, hashed
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }
    // generate jwt
    const payload = {
      // user identifier
      id: user._id,
      email: user.email,
      username: user.username,
      // firstName: user.firstName,
      // lastName: user.lastName,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }); // 30 days
    return { token, user };
  }
  async getUserbyId(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "user not found");
    }
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    if (user.email !== data.email) {
      const checkEmail = await userRepository.getUserByEmail(data.email!);
      if (checkEmail) {
        throw new HttpError(409, "Email already in use");
      }
    }
    if (user.username !== data.username) {
      const checkUsername = await userRepository.getUserByUsername(
        data.username!,
      );
      if (checkUsername) {
        throw new HttpError(403, "Username already in use");
      }
    }
    if (data.password) {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }
    const updatedUser = await userRepository.updateUser(userId, data);
    return updatedUser;
  }

  async sendResetPasswordEmail(email?: string) {
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
    if (!email) {
      throw new HttpError(400, "Email is required");
    }
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" }); // 1 hour expiry
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
    await sendEmail(user.email, "Password Reset", html);
    return user;
  }

  async deleteMe(userId: string, password: string) {
    const user = await userRepository.getUserById(userId); // create if missing
    if (!user) throw new HttpError(404, "User not found");

    // if user.password is the hashed password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(400, "Password is incorrect");

    const deleted = await userRepository.deleteUser(userId);
    if (!deleted) throw new HttpError(404, "User not found");

    return true;
  }
  //reset password token
  async resetPassword(token?: string, newPassword?: string) {
    try {
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and new password are required");
      }
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      await userRepository.updateUser(userId, { password: hashedPassword });
      return user;
    } catch (error) {
      throw new HttpError(400, "Invalid or expired token");
    }
  }
}
