const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP details are configured
  const isSmtpConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  let transporter;

  if (isSmtpConfigured) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Console log fallback
    console.log('\n--- EMAIL SIMULATION (SMTP Not Configured) ---');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.message}`);
    console.log('----------------------------------------------\n');
    return { messageId: 'simulated-id' };
  }

  const message = {
    from: process.env.EMAIL_FROM || 'RentalHouse <noreply@rentalhouse.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('SMTP sending error:', error.message);
    // Silent fallback to console log
    console.log('\n--- SMTP FAILED. EMAIL DUMP ---');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.message}`);
    console.log('--------------------------------\n');
    return { messageId: 'failed-smtp-fallback-id' };
  }
};

// Send Registration Email
const sendRegistrationEmail = async (user) => {
  const message = `Welcome to RentalHouse, ${user.name}! Your account has been registered successfully with the role: ${user.role}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2b6cb0;">Welcome to RentalHouse!</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your account has been registered successfully on our platform.</p>
      <p><strong>Role:</strong> ${user.role.toUpperCase()}</p>
      <p>Thank you for choosing RentalHouse. Start exploring your dream homes today!</p>
      <br>
      <p>Best regards,<br>The RentalHouse Team</p>
    </div>
  `;
  return await sendEmail({
    email: user.email,
    subject: 'Welcome to RentalHouse!',
    message,
    html
  });
};

// Send Booking Confirmation Email
const sendBookingEmail = async (tenant, owner, property, booking, status) => {
  // Notify tenant
  const tenantMsg = `Your booking request for "${property.title}" has been updated to: ${status}.`;
  const tenantHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2b6cb0;">Booking Request Status Update</h2>
      <p>Hello <strong>${tenant.name}</strong>,</p>
      <p>Your booking request for the property <strong>${property.title}</strong> has been <strong>${status.toUpperCase()}</strong> by the owner.</p>
      <p><strong>Rent:</strong> $${property.rent}/month</p>
      <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
      <p>If you have any questions, please contact the owner at ${owner.email} / ${owner.phone}.</p>
      <br>
      <p>Best regards,<br>The RentalHouse Team</p>
    </div>
  `;
  await sendEmail({
    email: tenant.email,
    subject: `Booking Request: ${status.toUpperCase()}`,
    message: tenantMsg,
    html: tenantHtml
  });

  // Notify owner (only if it is a new booking request)
  if (status === 'pending') {
    const ownerMsg = `You have received a new booking request for "${property.title}" from ${tenant.name}.`;
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2b6cb0;">New Booking Request Received</h2>
        <p>Hello <strong>${owner.name}</strong>,</p>
        <p>You have received a new booking request for your listing <strong>${property.title}</strong>.</p>
        <p><strong>Tenant Name:</strong> ${tenant.name}</p>
        <p><strong>Tenant Contact:</strong> ${tenant.email} / ${tenant.phone}</p>
        <p>Please log in to your Owner Dashboard to approve or reject this request.</p>
        <br>
        <p>Best regards,<br>The RentalHouse Team</p>
      </div>
    `;
    await sendEmail({
      email: owner.email,
      subject: `New Booking Request for ${property.title}`,
      message: ownerMsg,
      html: ownerHtml
    });
  }
};

// Send Inquiry Notification Email
const sendInquiryEmail = async (owner, property, inquiry) => {
  const message = `You have received a new inquiry on your property "${property.title}" from ${inquiry.name}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2b6cb0;">New Property Inquiry</h2>
      <p>Hello <strong>${owner.name}</strong>,</p>
      <p>You have received a new inquiry regarding your property <strong>${property.title}</strong>.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p><strong>Inquirer Name:</strong> ${inquiry.name}</p>
      <p><strong>Email:</strong> ${inquiry.email}</p>
      <p><strong>Phone:</strong> ${inquiry.phone}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f7fafc; padding: 15px; border-left: 4px solid #2b6cb0; margin: 10px 0;">
        ${inquiry.message}
      </blockquote>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p>Please reply directly to the inquirer or view your listings inside your Owner Dashboard.</p>
      <br>
      <p>Best regards,<br>The RentalHouse Team</p>
    </div>
  `;
  return await sendEmail({
    email: owner.email,
    subject: `New Inquiry: ${property.title}`,
    message,
    html
  });
};

module.exports = {
  sendRegistrationEmail,
  sendBookingEmail,
  sendInquiryEmail
};
