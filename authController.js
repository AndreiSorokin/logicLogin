const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('./config')
const { validationResult } = require('express-validator')

const generateAccessToken = (id, roles) => {
   const payload = {
      id,
      roles
   }
   return jwt.sign(payload, secret, {expiresIn:"1h"})
}

class authController {
   async registration(req,res) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return res.status(400).json({message:'Registration error', errors})
         }
         const { username, password } = req.body
         const candidate = await User.findOne({username})
         if(candidate){
            return res.status(400).json({message:"This use is already exist"})
         }
         const hashedPassword = bcrypt.hashSync(password, 7)
         const userRole = await Role.findOne({value:"USER"})
         const user = new User({username, password: hashedPassword, roles:[userRole.value]})
         await user.save()
         return res.json({message: "The user has been created"})
      } catch (error) {
         console.log(error)
         res.status(400).json('Registration error')
      }
   }
   async login(req,res) {
      try {
         const { username, password } = req.body
         const user = await User.findOne({username})
         if(!user) {
            return res.status(400).json({message:`The user ${username} is not found`})
         }
         const validPassword = bcrypt.compareSync(password, user.password)
         if(!validPassword) {
            return res.status(400).json({message:"Wrong password"})
         }
         const token = generateAccessToken(user.id, user.roles)
         return res.json({token})
      } catch (error) {
         console.log(error)
         res.status(400).json({messsage:'Login error'})
      }
   }
   async getUsers(req,res) {
      try {
         const users = await User.find()
         res.json(users)
      } catch (error) {
         console.log(error)
      }
   }
}

module.exports = new authController()