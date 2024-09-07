import dbConnect from '@/lib/mongodb';
import users from '../../../../../models/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  const { identifier, password } = await req.json(); // Use 'identifier' for both email/username

  await dbConnect();

  try {
    // Find user by either email or username
    const user = await users.findOne({
      $or: [{ email: identifier }, { name: identifier }],
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Something went wrong', error }), { status: 500 });
  }
}
