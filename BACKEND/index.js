const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const Donor = mongoose.model('Donor', new mongoose.Schema({
  fullName: String,
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  email: String,
  mobileNumber: String,
  state: String,
  district: String,
  donationDate: { type: Date, default: Date.now }
}));

const Request = mongoose.model('Request', new mongoose.Schema({
  patientName: String,
  doctorName: String,
  bloodGroup: String,
  state: String,
  district: String,
  hospitalName: String,
  contactName: String,
  mobileNumber: String,
  email: String,
}));

mongoose.connect('mongodb://localhost:27017/bloodbridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to mongoDB');
})
.catch(err => console.error('Could not connect to MongoDB...', err))

app.get('/', (req, res) => {
  res.send('Welcome to the Blood Bridge API');
});

// Validation function for email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation function for mobile number
function isValidMobileNumber(mobileNumber) {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobileNumber);
}

app.post('/donate', async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).send({ message: 'Invalid email format' });
    }
    if (!isValidMobileNumber(mobileNumber)) {
      return res.status(400).send({ message: 'Invalid mobile number format' });
    }
    const donorData = {
      ...req.body,
      donationDate: new Date()
    };
    const donor = new Donor(donorData);
    await donor.save();
    res.send({ message: 'Donor information saved successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error saving donor information', error });
  }
});

app.post('/request', async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).send({ message: 'Invalid email format' });
    }
    if (!isValidMobileNumber(mobileNumber)) {
      return res.status(400).send({ message: 'Invalid mobile number format' });
    }
    const request = new Request(req.body);
    await request.save();
    
    const { bloodGroup, state } = req.body;
    const matchingDonors = await Donor.find({ bloodGroup, state });
    
    const donorsWithExpiry = matchingDonors.map(donor => {
      const donationDate = new Date(donor.donationDate);
      const expiryDate = new Date(donationDate);
      expiryDate.setDate(expiryDate.getDate() + 42);
      
      return {
        ...donor.toObject(),
        donationDate: donationDate.toLocaleDateString(),
        expiryDate: expiryDate.toLocaleDateString()
      };
    });
    
    res.send({ message: 'Request information saved successfully', matchingDonors: donorsWithExpiry });
  } catch (error) {
    res.status(500).send({ message: 'Error saving request information', error });
  }
});

app.get('/donors', async (req, res) => {
  try {
    const donors = await Donor.find();
    res.send(donors);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching donors', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});