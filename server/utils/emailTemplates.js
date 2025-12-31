const getEmailHeader = () => `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- No theme / no color-scheme -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">

    <style>
        /* Force everything to light look — no dark mode support, no auto adjustments */
        body, table, td, div, p, a, span {
            background-color: #ffffff !important;
            color: #4a4a4a !important;
            font-family: 'Playfair Display', serif, sans-serif !important;
        }

        /* Structural styling kept minimal for email compatibility */
        .email-container {
            background-color: #ffffff !important;
        }

        .content-box {
            background-color: #ffffff !important;
            border: 1px solid #eeeeee !important;
        }

        .text-main {
            color: #4a4a4a !important;
        }

        .text-sub {
            color: #6b6b6b !important;
        }

        .footer-box {
            background-color: #fce5cd !important;
        }

        .footer-text {
            color: #8c6239 !important;
        }

        .otp-box {
            background-color: #f3f3f3 !important;
            border: 1px solid #cccccc !important;
            color: #111111 !important;
        }

        .info-card {
            background-color: #f9f9f9 !important;
            border: 1px solid #eeeeee !important;
        }

        h1, h2, h3 {
            color: #4a4a4a !important;
        }
    </style>
</head>
`;

const getEmailBrandingHeader = () => `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fce5cd;">
    <tr>
        <td align="center" valign="top"
            background="https://calender-event.s3.ap-south-1.amazonaws.com/event-images/Group.png" 
            style="background-image: url('https://calender-event.s3.ap-south-1.amazonaws.com/event-images/Group.png');
                   background-repeat: no-repeat;
                   background-size: cover;
                   background-position: center;
                   padding: 40px 20px;">
            <!--[if gte mso 9]>
            <v:rect xmlns:v='urn:schemas-microsoft-com:vml' fill='true' stroke='false' style='width:600px;height:120px;'>
                <v:fill type='frame' src='https://calender-event.s3.ap-south-1.amazonaws.com/event-images/Group.png' color='#fce5cd'/>
                <v:textbox inset='0,0,0,0'>
            <![endif]-->
            <img src="https://calender-event.s3.ap-south-1.amazonaws.com/event-images/logo.png"
                 alt="Heritage Lane & Co" 
                 style="display:block; width:60%; max-width:200px; height:auto;">
            <!--[if gte mso 9]>
                </v:textbox>
            </v:rect>
            <![endif]-->
        </td>
    </tr>
</table>
`;

const getEmailFooter = () => `
<!-- Stay Connected Footer -->
<div class="footer-box" style="background-color: #fce5cd; padding: 40px 20px; text-align: center;">
    <h3 class="footer-text" style="color: #8c6239; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0; font-weight: normal; font-size: 20px;">Stay Connected</h3>
    <div style="border-top: 1px solid #d4a373; width: 80%; margin: 0 auto 25px auto;"></div>
    
    <div style="margin-bottom: 30px;">
        <a href="#" style="text-decoration: none; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="24" height="24" alt="FB"></a>
        <a href="#" style="text-decoration: none; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" alt="IG"></a>
        <a href="tel:0468727125" style="text-decoration: none; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/159/159832.png" width="24" height="24" alt="Call"></a>
        <a href="https://heritagelane.com.au" style="text-decoration: none; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="24" height="24" alt="Web"></a>
    </div>

    <p class="footer-text" style="font-size: 12px; color: #8c6239; margin-bottom: 20px;">Address - 1/22-30 Wallace Ave, Point Cook VIC 3030, Australia</p>

    <!-- Bottom Decorative Arch -->
    <div style="width: 80px; height: 60px; margin: 0 auto; border: 2px solid #d4a373; border-bottom: none; border-radius: 80px 80px 0 0; position: relative; padding-top: 15px;">
        <img src="https://calender-event.s3.ap-south-1.amazonaws.com/event-images/logo.png" width="30" alt="logo">
    </div>
</div>
`;

const getGuestEmailHtml = ({
    guestName,
    eventTitle,
    formattedDate,
    timezone,
    eventData,
    meetingLink,
    guestMobile,
    notes,
}) => {
    const firstName = guestName ? guestName.split(" ")[0] : "there";

    return `
<!DOCTYPE html>
<html lang="en">
${getEmailHeader()}
<body class="body" style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <div class="email-container" style="font-family: 'Playfair Display', serif, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; color: #4a4a4a; line-height: 1.6; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
        ${getEmailBrandingHeader()}

        <div style="padding: 40px 50px;">
            <h2 class="text-main" style="font-size: 18px; margin-bottom: 25px; font-weight: bold;">Your Heritage Lane Furniture Viewing is Confirmed</h2>

            <p class="text-main" style="font-size: 16px; margin-bottom: 25px;">Hi ${firstName},</p>
            
            <p class="text-main" style="font-size: 14px; margin-bottom: 20px;">Thank you for booking an Exclusive viewing at Heritage Lane & Co. Your appointment is confirmed for <strong>${formattedDate}</strong> at our showroom.</p>
            
            <p class="text-main" style="font-size: 14px; margin-bottom: 25px;">During your visit, you’ll be discover our handcrafted teakwood furniture up close, explore different styles and finishes that bring a distinct character and warm ambience to your home. During your visit you are welcome to discuss any custom requirements with our team. Stay as long as you like, explore every detail, and experience how true craftsmanship and solid wood comfort can transform your home.</p>

            <div class="info-card" style="margin-bottom: 25px; padding: 15px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
                <p class="text-main" style="font-size: 14px; margin: 0;"><strong>Location:</strong> Heritage Lane & Co. Showroom</p>
                <p class="text-main" style="font-size: 14px; margin: 4px 0;"><strong>Address:</strong> ${eventData.locationAddress ||
        "1/22–30 Wallace Ave, Point Cook VIC 3030"
        }</p>
            </div>

            <p class="text-main" style="font-size: 14px; margin-bottom: 25px;">If you need to reschedule or have any questions before your visit, simply reply to this email or call us on <strong>0 468 727 125</strong>.</p>

            <p class="text-main" style="font-size: 14px; margin-bottom: 30px;">We look forward to welcoming you to Heritage Lane & Co. and helping you find furniture you’ll truly fall in love with.</p>

            <p class="text-main" style="font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666 !important;">
                <strong>PS:</strong> As promised, your exclusive 15% discount is waiting! 🌟 Use code <strong>INVITE15</strong> on our website or show this email in-store to unlock savings across our entire range.
            </p>
        </div>

        ${getEmailFooter()}

      
    </div>
</body>
</html>
    `;
};

const getHostEmailHtml = ({
    hostName,
    guestName,
    guestEmail,
    eventTitle,
    formattedDate,
    guestMobile,
    eventData,
    meetingLink,
    notes,
    additionalGuests,
    duration,
    timezone,
    selectedLink
}) => `
<!DOCTYPE html>
<html lang="en">
${getEmailHeader()}
<body class="body" style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <div class="email-container" style="font-family: 'Playfair Display', serif, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; color: #4a4a4a; line-height: 1.6; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
        ${getEmailBrandingHeader()}

        <div style="padding: 40px 50px;">
            <p class="text-main" style="font-size: 16px; margin-bottom: 25px;">Hi ${hostName || "Heritage Lane & Co Furniture"
    },</p>
            
            <p class="text-main" style="font-size: 14px; margin-bottom: 30px;">A new invitee has been scheduled for your event.</p>

            <div class="info-card" style="background-color: #f9fafb; padding: 25px; border-radius: 12px; border: 1px solid #f3f4f6;">
                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Event Type</p>
                    <p class="text-main" style="font-size: 15px; margin: 0; font-weight: bold; color: #111827;">${eventTitle} (${duration} min)</p>
                </div>

                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Invitee</p>
                    <p class="text-main" style="font-size: 15px; margin: 0; font-weight: bold; color: #111827;">${guestName} (<a href="mailto:${guestEmail}" style="color: #2563eb; text-decoration: none;">${guestEmail}</a>)</p>
                </div>

                ${additionalGuests && additionalGuests.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Additional Guests</p>
                    <p class="text-main" style="font-size: 14px; margin: 0; color: #111827;">${additionalGuests.join(", ")}</p>
                </div>
                ` : ""}

                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Date / Time / Timezone</p>
                    <p class="text-main" style="font-size: 15px; margin: 0; font-weight: bold; color: #111827;">${formattedDate}</p>
                    <p class="text-sub" style="font-size: 12px; color: #6b7280; margin: 2px 0 0 0;">(Timezone: ${timezone || "Not specified"})</p>
                </div>

                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Mobile</p>
                    <p class="text-main" style="font-size: 15px; margin: 0; font-weight: bold; color: #111827;">${guestMobile || "N/A"}</p>
                </div>

                ${selectedLink ? `
                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Interested Product / Selection</p>
                    <p class="text-main" style="font-size: 14px; margin: 0; color: #111827;">${selectedLink}</p>
                </div>
                ` : ""}

                ${notes ? `
                <div style="margin-bottom: 15px;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Additional Notes</p>
                    <p class="text-main" style="font-size: 14px; margin: 0; color: #111827; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #eee;">${notes}</p>
                </div>
                ` : ""}

                ${eventData.location === "gmeet" && meetingLink
        ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Google Meet Link</p>
                    <a href="${meetingLink}" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">${meetingLink}</a>
                </div>
                `
        : `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <p class="text-sub" style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 5px 0;">Location</p>
                    <p class="text-main" style="font-size: 14px; margin: 0; color: #111827;">${eventData.locationAddress || "1/22-30 Wallace Ave, Point Cook VIC 3030"}</p>
                </div>
                `
    }
            </div>
        </div>

        ${getEmailFooter()}
    </div>
</body>
</html>
`;

const getOtpEmailHtml = (otp) => `
<!DOCTYPE html>
<html lang="en">
${getEmailHeader()}
<body class="body" style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <div class="email-container" style="font-family: 'Playfair Display', serif, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; color: #4a4a4a; line-height: 1.6; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
        ${getEmailBrandingHeader()}

        <div style="padding: 50px 50px; text-align: center;">
            <h2 class="text-main" style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
            <p class="text-sub" style="font-size: 15px; margin-bottom: 30px; color: #666;">Please use the following code to confirm your email address and complete your booking.</p>
            
            <div class="otp-box" style="background-color: #fce5cd; padding: 25px; border-radius: 12px; display: inline-block; min-width: 200px; margin-bottom: 30px; border: 1px dashed #d4a373;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8c6239;">${otp}</span>
            </div>
            
            <p class="text-sub" style="font-size: 13px; color: #999;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        </div>

        ${getEmailFooter()}
    </div>
</body>
</html>
`;

module.exports = {
    getGuestEmailHtml,
    getHostEmailHtml,
    getOtpEmailHtml,
};
