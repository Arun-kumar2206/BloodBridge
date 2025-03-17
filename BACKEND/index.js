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
  mobileNumber: String,
  state: String,
  district: String,
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

app.post('/donate', async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.send({ message: 'Donor information saved successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error saving donor information', error });
  }
});

app.post('/request', async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    
    const { bloodGroup, state } = req.body;
    const matchingDonors = await Donor.find({ bloodGroup, state });
    
    res.send({ message: 'Request information saved successfully', matchingDonors });
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
