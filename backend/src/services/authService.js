const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/appConfig');
const userRepository = require('../repositories/userRepository');

class AuthService {
  async registerStudent(studentData) {
    const existingUser = await userRepository.findByEmail(studentData.email);
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(studentData.password, saltRounds);

    const userWithProfile = await userRepository.createStudentUser({
      ...studentData,
      hashedPassword
    });

    const token = this.generateToken(userWithProfile);

    return {
      token,
      user: {
        id: userWithProfile.id,
        email: userWithProfile.email,
        role: userWithProfile.role,
        studentId: userWithProfile.student.id,
        fullName: userWithProfile.student.fullName
      }
    };
  }

  async registerCompany(companyData) {
    const existingUser = await userRepository.findByEmail(companyData.email);
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(companyData.password, saltRounds);

    const userWithProfile = await userRepository.createCompanyUser({
      ...companyData,
      hashedPassword
    });

    const token = this.generateToken(userWithProfile);

    return {
      token,
      user: {
        id: userWithProfile.id,
        email: userWithProfile.email,
        role: userWithProfile.role,
        companyId: userWithProfile.company.id,
        companyName: userWithProfile.company.companyName
      }
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.student ? user.student.id : null,
        companyId: user.company ? user.company.id : null,
        profile: user.student || user.company || null
      }
    };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student ? user.student.id : null,
      companyId: user.company ? user.company.id : null,
      profile: user.student || user.company || null
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
