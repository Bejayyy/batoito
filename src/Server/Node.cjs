const http = require('http');
const nodemailer = require('nodemailer');

const port = 3000;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'josephigot219@gmail.com',
    pass: 'rrdm ffqc ihmn chmo',
  },
});

const server = http.createServer((req, res) => {
  // Allow all origins, including any localhost port
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; // No Content
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/send-email') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const formData = JSON.parse(body);
      const { name, email, eventDate } = formData;

      const mailOptions = {
        from: '"Norlitz Bato Films" <no-reply@yourcompany.com>',
        to: email,
        subject: 'Booking Confirmation Received',
        text: `Hello ${name},

        We’ve received your booking request. It’s currently pending, and we’ll notify you via email once it’s confirmed.

        Thank you for choosing our services!
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Email sent successfully.' }));
      } catch (error) {
        console.error('Error sending email:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Error sending email.' }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/send-status-email') {
    let body = '';
  
    req.on('data', chunk => {
      body += chunk.toString();
    });
  
    req.on('end', async () => {
      try {
        const formData = JSON.parse(body);
        console.log("Parsed formData:", formData); // Debugging
  
        const { name, email, status, package: servicePackage } = formData;
  
        // Validate the status field
        if (!status || typeof status !== 'string') {
          console.error("Status is missing or not a string:", status);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Status is missing or invalid.' }));
          return;
        }
  
        console.log("Received status:", status); // Debugging
        console.log("Received package:", servicePackage); // Debugging
  
        let emailText;
        let subject;
  
        // Separate email template for "completed" status
        if (status === 'completed') {
          emailText = `Dear ${name},
  We are writing to inform you that the status of your booking for "${servicePackage}" has been updated. The current status is now: ${status}.
  
  If you have any questions or need further assistance, please do not hesitate to contact us.
  
  Thank you for choosing Norlitz Bato Films.
  
  We would love to hear your feedback! Please rate your experience by clicking the link below:
  http://localhost:5173/?rating=true&package=${encodeURIComponent(servicePackage)}
  
  Sincerely,
  The Norlitz Bato Films Team`;
  
          subject = `Booking Status Update: ${status} - ${servicePackage}`;
        } else {
          // Default email template for other statuses
          emailText = `Dear ${name},
  We are writing to inform you that the status of your booking for "${servicePackage}" has been updated. The current status is now: ${status}.
  
  If you have any questions or need further assistance, please do not hesitate to contact us.
  
  Thank you for choosing Norlitz Bato Films.
  
  Sincerely,
  The Norlitz Bato Films Team`;
  
          subject = `Booking Status Update: ${status} - ${servicePackage}`;
        }
  
        console.log("Email content:", emailText); // Debugging
  
        const mailOptions = {
          from: '"Norlitz Bato Films" <no-reply@yourcompany.com>',
          to: email,
          subject: subject,
          text: emailText,
        };
  
        await transporter.sendMail(mailOptions);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Status email sent successfully.' }));
      } catch (error) {
        console.error('Error processing request:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Error processing request.' }));
      }
    });
  }else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

// Use '0.0.0.0' instead of 'localhost' to allow connections from any localhost port
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});