
const ADMIN_KEY = process.env.ADMIN_KEY || process.env.ADMIN_SECRET_KEY || 'arnob1812'

const auth = (req, res, next) => {
  const key = req.headers['x-admin-key']
  
  if (key === ADMIN_KEY) {
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized. Admin key required.' })
  }
}

module.exports = auth
