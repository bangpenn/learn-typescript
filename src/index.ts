import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(express.json())

interface UserData {
    id: string;
    name: string;
    address: string;
    
}

interface ValidatonRequest extends Request {

    userData: UserData
}

const accessValidation = (req: Request, res: Response, next: NextFunction) => {
    const validatonReq = req as ValidatonRequest
    const {authorization} = validatonReq.headers;

    if(!authorization) {
        return res.status(401).json({
            message: 'Token diperlukan'
        })
    }

    const token = authorization.split(' ')[1];
    const secret = process.env.JWT_SECRET!;

    try {
        const jwtDecode = jwt.verify(token, secret)

        if(typeof jwtDecode !== 'string'){
            validatonReq.userData = jwtDecode as UserData
        }
        

    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }

    next()


}


// REGISTER
app.use('/register', async (req, res) => {
    const {name, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.users.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        }
    })

    res.json({
        data: result,
        message: 'user created'
    })
})

// LOGIN

app.use('/login', async (req, res) => {
    const {email, password} = req.body;

    const user = await prisma.users.findUnique({
        where: {
            email: email
        }
    })

    if(!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    if(!user.password) {
        return res.status(404).json({
            message: 'Password not set'
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password)

    if(isPasswordValid) {
        const payload = {
            id: user.id,
            name: user.name,
            address: user.address
        }
        
        const secret = process.env.JWT_SECRET!;

        const expiresIn = 60 * 60 * 1;

        const token = jwt.sign(payload, secret, {expiresIn: expiresIn})

        return res.json({
            data: {
                id: user.id,
                name: user.name,
                address: user.address
            },
            token: token
        })
    } else {
        return res.status(403).json({
            message: 'Password wrong'
        })
    }
})

// CREATE
app.post('/users', async (req, res, next) => {
    const {name, email, address} = req.body;
   const result = await prisma.users.create({
    data: {
        name: name,
        email: email,
        address: address
    }
   })

   res.json({
    data: result,
    messsage: `User Created`
   })
})


// READ
app.get('/users', accessValidation, async (req, res) => {
    const result = await prisma.users.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        }
    });
    res.json({
        data: result,
        message: 'Users listed'
    })
})

// UPDATE
app.patch('/users/:id', accessValidation, async (req, res) => {
    const {id} = req.params
    const {name, email, address} = req.body

    const result = await prisma.users.update({
        data: {
            name: name,
            email: email,
            address: address,
        },
        where: {
            id: Number(id)
        }
    })
    res.json({
        data: result,
        message: `User ${id} updated`
    })
})

// DELETE
app.delete('/users/:id', accessValidation,  async (req, res) => {
    const {id} = req.params

    const result = await prisma.users.delete({
        where: {
            id: Number(id)
        }
    })
    res.json({message: `User ${id} deleted`})
})


app.listen(PORT, () => {
    console.log(`Server running in PORT: ${PORT}`)
})