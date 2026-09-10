const FAQS = [
  {
    question: "How long does delivery take?",
    answer: "Orders are dispatched within 24–48 hours and typically delivered within 3–7 business days across India.",
  },
  {
    question: "What is your return policy?",
    answer: "Eligible products can be returned within 7 days of delivery, unused and with original tags and packaging.",
  },
  {
    question: "Does this saree come with a blouse piece?",
    answer: "Check the \"Blouse Included\" detail above for this specific product — it varies by saree.",
  },
  {
    question: "How should I care for this saree?",
    answer: "See the Care Instructions section above. When in doubt, we recommend gentle dry cleaning for silk and designer sarees.",
  },
];

export function ProductFaq() {
  return (
    <section className="mt-8 border-t border-border pt-8">
      <h2 className="font-display text-xl font-semibold text-charcoal">Frequently Asked Questions</h2>
      <div className="mt-4 divide-y divide-border">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-charcoal marker:content-none">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm text-ink-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
