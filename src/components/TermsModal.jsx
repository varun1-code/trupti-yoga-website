export default function TermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
            <p className="text-gray-400 text-xs mt-0.5">Trupti Yoga & Nature Cure</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors text-lg font-light"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-6 flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">

          <section>
            <h3 className="font-bold text-gray-800 mb-2">1. Acceptance of Terms</h3>
            <p>
              By creating an account and enrolling in any membership plan on this platform, you confirm that you have read, understood, and agreed to these Terms and Conditions. If you do not agree, please do not proceed with registration or payment.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">2. Services Offered</h3>
            <p>
              Trupti Yoga & Nature Cure, led by Dr. Vishwa Hiremath (BNYS), provides live online yoga and naturopathy sessions conducted via Google Meet. Three sessions are held daily at <strong>6:00 AM</strong>, <strong>8:00 AM</strong>, and <strong>11:00 AM IST</strong>. All sessions are included in every membership plan.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">3. Membership & Payment</h3>
            <ul className="flex flex-col gap-1.5 list-disc list-inside">
              <li>Plans available: 1 Month (₹1,000), 6 Months (₹5,000), 1 Year (₹10,000).</li>
              <li>Payment is made via UPI. After submitting your UPI Transaction ID, membership is activated manually by our team, typically within a few hours.</li>
              <li>You will receive access to your dashboard and Google Meet session links once your payment is verified.</li>
              <li>Membership covers personal use only and is non-transferable.</li>
            </ul>
          </section>

          <section className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <h3 className="font-bold text-red-700 mb-2">4. No Refund Policy</h3>
            <p className="text-red-700">
              <strong>All payments made to Trupti Yoga & Nature Cure are strictly non-refundable.</strong> Once a payment has been submitted and verified, no refund will be issued under any circumstances, including but not limited to:
            </p>
            <ul className="flex flex-col gap-1 list-disc list-inside mt-2 text-red-600">
              <li>Change of mind or personal reasons</li>
              <li>Inability to attend sessions</li>
              <li>Technical issues on your end (device, internet, etc.)</li>
              <li>Early discontinuation of membership</li>
            </ul>
            <p className="mt-3 text-red-700">
              Please review your chosen plan carefully before making payment. For any concerns, contact us on WhatsApp before completing your payment.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">5. Health Disclaimer</h3>
            <p>
              Yoga and naturopathy are complementary wellness practices. While our sessions are guided by a certified BNYS professional, they are not a substitute for professional medical treatment or advice. We strongly recommend:
            </p>
            <ul className="flex flex-col gap-1.5 list-disc list-inside mt-2">
              <li>Consulting your doctor before beginning any yoga programme, especially if you have an existing medical condition.</li>
              <li>Informing Dr. Vishwa of any injuries, surgeries, or health conditions before your first session.</li>
              <li>Listening to your body and stopping any exercise that causes pain or discomfort.</li>
            </ul>
            <p className="mt-2">
              Trupti Yoga & Nature Cure will not be held responsible for any injury or health issue arising from participation in sessions.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">6. Session Schedule & Availability</h3>
            <p>
              Sessions are conducted daily in IST. In the event of a cancellation or change in schedule, registered members will be informed via WhatsApp at the earliest. Occasional changes to session timings or links may occur; members are advised to check their dashboard before joining.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">7. Code of Conduct</h3>
            <ul className="flex flex-col gap-1.5 list-disc list-inside">
              <li>Members must maintain respectful and appropriate behaviour during all live sessions.</li>
              <li>Recording, screenshotting, or redistributing any session content is strictly prohibited.</li>
              <li>Sharing your Google Meet link or account credentials with others is not permitted.</li>
              <li>Trupti Yoga reserves the right to revoke access without refund if any member violates these conduct rules.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">8. Privacy</h3>
            <p>
              Your personal information (name, phone number, email address, and location) is collected solely for the purpose of membership management and session access. We do not share, sell, or disclose your information to any third parties.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-2">9. Contact Us</h3>
            <p>
              For any questions about these terms or your membership, please reach out to us on WhatsApp:{' '}
              <a
                href="https://wa.me/918088943510"
                target="_blank" rel="noopener noreferrer"
                className="text-green-600 font-semibold hover:underline"
              >
                +91 80889 43510
              </a>
            </p>
          </section>

          <p className="text-gray-400 text-xs border-t border-gray-100 pt-4">
            Last updated: June 2025. These terms are subject to change. Continued use of the service constitutes acceptance of any revised terms.
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all"
          >
            I Have Read and Understood
          </button>
        </div>
      </div>
    </div>
  )
}
