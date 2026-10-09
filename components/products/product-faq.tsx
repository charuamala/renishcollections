/** FAQ answers come from this product's data and the store's confirmed settings; a question without a real answer is left out. */
export function ProductFaq({
  deliveryTime,
  returnPolicy,
  blouseIncluded,
  careInstructions,
}: {
  deliveryTime: string | null;
  returnPolicy: string | null;
  blouseIncluded: boolean | null;
  careInstructions: string | null;
}) {
  const faqs: { question: string; answer: string }[] = [];

  if (deliveryTime) {
    faqs.push({ question: "How long does delivery take?", answer: `Orders are delivered in ${deliveryTime}.` });
  }
  if (returnPolicy) {
    faqs.push({ question: "What is your return policy?", answer: returnPolicy });
  }
  if (blouseIncluded !== null) {
    faqs.push({
      question: "Does this saree come with a blouse piece?",
      answer: blouseIncluded ? "Yes, this saree comes with a blouse piece." : "No, this saree does not include a blouse piece.",
    });
  }
  if (careInstructions) {
    faqs.push({ question: "How should I care for this saree?", answer: careInstructions });
  }

  if (faqs.length === 0) return null;

  return (
    <section className="mt-8 border-t border-border pt-8">
      <h2 className="font-display text-xl font-semibold text-charcoal">Frequently Asked Questions</h2>
      <div className="mt-4 divide-y divide-border">
        {faqs.map((faq) => (
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
