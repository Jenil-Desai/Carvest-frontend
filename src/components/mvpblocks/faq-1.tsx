import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';

const items = [
  {
    id: '1',
    title: 'What is Carvest?',
    content:
      'Carvest is a decentralized crowdfunding platform built on the Ethereum blockchain. It allows creators to raise funds transparently while ensuring contributors’ money is secure through smart contracts.',
  },
  {
    id: '2',
    title: 'How do I start a campaign?',
    content:
      'To start a campaign, connect your Web3 wallet, provide details such as name, description, funding goal, and deadline. Once created, your campaign is deployed on the Ethereum blockchain.',
  },
  {
    id: '3',
    title: 'How can I contribute to a campaign?',
    content:
      "Simply connect your Web3 wallet (e.g., MetaMask), choose a campaign, and send your contribution in Ether. The transaction is recorded on-chain instantly.",
  },
  {
    id: '4',
    title: 'What happens if a campaign does not reach its goal?',
    content:
      'If a campaign fails to meet its goal by the deadline, contributors can claim a refund directly through the smart contract. No middleman is required.',
  },
  {
    id: '5',
    title: 'Is my contribution safe?',
    content:
      "Yes. Contributions are held in Ethereum smart contracts. Funds can only be withdrawn by the campaign owner if the funding goal is successfully met.",
  },
  {
    id: '6',
    title: "Do I need cryptocurrency knowledge to use Carvest?",
    content: "Basic understanding of Ethereum and wallets is helpful, but Carvest is designed with a simple interface so anyone can contribute or create campaigns easily."
  },
  {
    id: '7',
    title: "Are there any fees?",
    content: "Carvest itself does not charge fees. The only cost involved is the standard Ethereum network gas fee for transactions."
  },
  {
    id: '8',
    title: "Can I track the progress of campaigns?",
    content: "Yes. All campaign details—including funds raised, deadlines, and contributors—are fully transparent and visible on the platform."
  }
];

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.4,
    },
  }),
};

export default function Faq1() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked{' '}
            <span className="from-primary bg-gradient-to-r to-rose-400 bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about Carvest and how to use our
            platform to raise your next funds quickly.
          </motion.p>
        </div>

        <motion.div
          className="relative mx-auto max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Decorative gradient */}
          <div className="bg-primary/10 absolute -top-4 -left-4 -z-10 h-72 w-72 rounded-full blur-3xl" />
          <div className="bg-primary/10 absolute -right-4 -bottom-4 -z-10 h-72 w-72 rounded-full blur-3xl" />

          <Accordion
            type="single"
            collapsible
            className="border-border/40 bg-card/30 w-full rounded-xl border p-2 backdrop-blur-sm"
            defaultValue="1"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={fadeInAnimationVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={item.id}
                  className={cn(
                    'bg-card/50 my-1 overflow-hidden rounded-lg border-none px-2 shadow-sm transition-all',
                    'data-[state=open]:bg-card/80 data-[state=open]:shadow-md',
                  )}
                >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={cn(
                        'group flex flex-1 items-center justify-between gap-4 py-4 text-left text-base font-medium',
                        'hover:text-primary transition-all duration-300 outline-none',
                        'focus-visible:ring-primary/50 focus-visible:ring-2',
                        'data-[state=open]:text-primary',
                      )}
                    >
                      {item.title}
                      <PlusIcon
                        size={18}
                        className={cn(
                          'text-primary/70 shrink-0 transition-transform duration-300 ease-out',
                          'group-data-[state=open]:rotate-45',
                        )}
                        aria-hidden="true"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent
                    className={cn(
                      'text-muted-foreground overflow-hidden pt-0 pb-4',
                      'data-[state=open]:animate-accordion-down',
                      'data-[state=closed]:animate-accordion-up',
                    )}
                  >
                    <div className="border-border/30 border-t pt-3">
                      {item.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
