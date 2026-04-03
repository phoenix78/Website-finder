import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { pseudo, email, password } = await req.json()

    if (!pseudo || !email || !password) {
      return NextResponse.json(
        { error: 'Pseudo, email et mot de passe requis.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { pseudo }] },
    })

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json({ error: 'Email déjà utilisé.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Pseudo déjà utilisé.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        pseudo,
        email,
        password: hashedPassword,
        name: pseudo,
      },
      select: { id: true, email: true, pseudo: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
