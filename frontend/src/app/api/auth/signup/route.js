import dbConnect from '@/lib/mongodb';
import users from '../../../../../models/users';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { name, email, password } = await req.json();

  await dbConnect();

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new users({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    return new Response(JSON.stringify({ message: 'User created successfully' }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Something went wrong', error }), { status: 500 });
  }
}
