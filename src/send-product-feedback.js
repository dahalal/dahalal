const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = (product, message) => {
  return resend.emails.send({
    from: 'product-feedback@resend.dev',
    to: 'hello.dahalal@gmail.com',
    subject: `Produkt-Feedback erhalten: ${product.id}`,
    html: `<b>Produkt:</b> ${product.name || '<i>Noch nicht im System</i>'}<br><br><b>Nachricht:</b><br>${message.replace(/\\n/g, "<br>")}`,
  });
}