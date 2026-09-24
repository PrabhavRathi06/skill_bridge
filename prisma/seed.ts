import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CITIES = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Chhatrapati Sambhajinagar']

const SKILLS_DATA = [
  { name: 'Mathematics Tutoring', category: 'Education' },
  { name: 'English Teaching', category: 'Education' },
  { name: 'Physics Coaching', category: 'Education' },
  { name: 'Web Development', category: 'Computer & IT' },
  { name: 'Data Recovery', category: 'Computer & IT' },
  { name: 'Laptop Repair', category: 'Computer & IT' },
  { name: 'Mobile Repair', category: 'Electronics' },
  { name: 'TV Repair', category: 'Electronics' },
  { name: 'AC Service', category: 'Electronics' },
  { name: 'Plumbing', category: 'Home Repair' },
  { name: 'Electrical Work', category: 'Home Repair' },
  { name: 'Carpentry', category: 'Home Repair' },
  { name: 'Graphic Design', category: 'Design' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Photography', category: 'Photography' },
  { name: 'Video Editing', category: 'Photography' },
  { name: 'Bike Repair', category: 'Vehicle' },
  { name: 'Car Service', category: 'Vehicle' },
  { name: 'Personal Training', category: 'Fitness' },
  { name: 'Yoga Teaching', category: 'Fitness' },
  { name: 'Content Writing', category: 'Writing' },
  { name: 'Resume Writing', category: 'Writing' },
  { name: 'Accounting', category: 'Business' },
  { name: 'Business Consulting', category: 'Business' },
]

const USERS = [
  { name: 'Prabhav Rathi', email: 'prabhav@demo.com', location: 'Pune' },
  { name: 'Ananya Deshmukh', email: 'ananya@demo.com', location: 'Pune' },
  { name: 'Rahul Patil', email: 'rahul@demo.com', location: 'Mumbai' },
  { name: 'Sneha Joshi', email: 'sneha@demo.com', location: 'Nagpur' },
  { name: 'Vikram Kulkarni', email: 'vikram@demo.com', location: 'Nashik' },
  { name: 'Priya Mehta', email: 'priya@demo.com', location: 'Pune' },
  { name: 'Arjun Nair', email: 'arjun@demo.com', location: 'Mumbai' },
  { name: 'Kavita Sharma', email: 'kavita@demo.com', location: 'Chhatrapati Sambhajinagar' },
]

const REQUESTS_DATA = [
  {
    title: 'Class 10 Math Tutor Needed',
    description: 'Looking for an experienced math tutor for my son who is in Class 10 CBSE. Need help with algebra, geometry, and trigonometry. Sessions 3 times a week for 1 hour each.',
    category: 'Education', location: 'Pune', budget: 600, urgency: 'NORMAL',
  },
  {
    title: 'Laptop Screen Replacement in Pune',
    description: 'My Dell Inspiron 15 laptop screen is cracked. Need someone to replace it. Have the replacement screen ready, just need labor. Should be done today.',
    category: 'Computer & IT', location: 'Pune', budget: 800, urgency: 'TODAY',
  },
  {
    title: 'Home Plumbing Issue — Leaking Pipe',
    description: 'There is a leaking pipe under the kitchen sink. Water is dripping constantly. Need a plumber to fix it urgently. Located in Koregaon Park, Pune.',
    category: 'Home Repair', location: 'Pune', budget: 500, urgency: 'URGENT',
  },
  {
    title: 'Logo Design for Small Business',
    description: 'Starting a new tiffin service and need a professional logo. Should look clean, modern, and food-related. Will provide color preferences. Need within 3 days.',
    category: 'Design', location: 'Mumbai', budget: 1500, urgency: 'NORMAL',
  },
  {
    title: 'iPhone 13 Screen Repair Mumbai',
    description: 'Dropped my iPhone 13 and the screen is shattered. Need someone who can replace the screen with original quality parts. Prefer someone who can come to my location.',
    category: 'Electronics', location: 'Mumbai', budget: 3500, urgency: 'URGENT',
  },
  {
    title: 'Personal Yoga Trainer — Morning Sessions',
    description: 'Looking for a certified yoga trainer for daily morning sessions from 6:30 AM to 7:30 AM. I am a beginner. Prefer female trainer. Location: Baner, Pune.',
    category: 'Fitness', location: 'Pune', budget: 400, urgency: 'LOW',
  },
  {
    title: 'Wedding Photography — Nagpur',
    description: 'Need a photographer for a small family wedding ceremony. Event is next weekend, approximately 4-5 hours. Need professional quality photos, not just mobile clicks.',
    category: 'Photography', location: 'Nagpur', budget: 8000, urgency: 'NORMAL',
  },
  {
    title: 'Bike Servicing — Honda Activa',
    description: 'My Honda Activa needs a full service including oil change, brake check, and chain adjustment. Has been 6 months since last service. Prefer someone who comes home.',
    category: 'Vehicle', location: 'Nashik', budget: 700, urgency: 'NORMAL',
  },
  {
    title: 'English Speaking Coach for Interview Prep',
    description: 'I have a job interview at a multinational company in 2 weeks. Need help improving my spoken English and interview confidence. 5 sessions of 45 minutes each.',
    category: 'Education', location: 'Mumbai', budget: 2000, urgency: 'NORMAL',
  },
  {
    title: 'Content Writing for E-commerce Website',
    description: 'Need product descriptions written for 50 items on my Shopify store. Items are electronics accessories. Content should be SEO-friendly and engaging.',
    category: 'Writing', location: 'Pune', budget: 3000, urgency: 'NORMAL',
  },
  {
    title: 'AC Not Cooling — Need Technician Today',
    description: 'Daikin split AC has stopped cooling. It runs but no cold air. This is urgent as temperatures are very high. Located in Wakad, Pune.',
    category: 'Electronics', location: 'Pune', budget: 600, urgency: 'TODAY',
  },
  {
    title: 'Freelance Accounting for Small Business',
    description: 'Own a small retail shop and need someone to handle monthly bookkeeping, GST returns, and annual tax filing. Looking for a CA or experienced accountant.',
    category: 'Business', location: 'Nagpur', budget: 5000, urgency: 'LOW',
  },
  {
    title: 'Electrical Work — Fan Installation x3',
    description: 'Need to install 3 ceiling fans in a new flat. All wiring is done, just need someone to mount the fans and connect them. Should take about 2 hours.',
    category: 'Home Repair', location: 'Chhatrapati Sambhajinagar', budget: 400, urgency: 'NORMAL',
  },
  {
    title: 'Graphic Designer for Social Media Posts',
    description: 'Need a graphic designer to create 10 social media post templates for Instagram and Facebook for my bakery business. Must be creative and understand branding.',
    category: 'Design', location: 'Pune', budget: 2000, urgency: 'NORMAL',
  },
  {
    title: 'Physics Tutor for JEE Preparation',
    description: 'Preparing for JEE Mains next year. Need a strong physics teacher who can explain concepts clearly and solve previous year problems. 5 days a week, 2 hours daily.',
    category: 'Education', location: 'Pune', budget: 1200, urgency: 'NORMAL',
  },
  {
    title: 'Website Development for Restaurant',
    description: 'Need a basic website for my restaurant with menu display, contact info, and online reservation form. Should be mobile-friendly and fast.',
    category: 'Computer & IT', location: 'Mumbai', budget: 15000, urgency: 'NORMAL',
  },
  {
    title: 'Car Dent Repair — Maruti Swift',
    description: 'My Maruti Swift has a dent on the rear bumper from a minor accident. Need someone who can remove/repair it without full repainting. Cost-effective solutions welcome.',
    category: 'Vehicle', location: 'Nashik', budget: 1500, urgency: 'LOW',
  },
  {
    title: 'Carpenter for Wardrobe Repair',
    description: 'One side panel of my wardrobe is broken and a hinge has come off. Need a carpenter to repair and reinforce it. The wardrobe is in the bedroom, very accessible.',
    category: 'Home Repair', location: 'Mumbai', budget: 800, urgency: 'NORMAL',
  },
  {
    title: 'Video Editor for YouTube Channel',
    description: 'Run a cooking channel on YouTube. Need a video editor who can edit 4-5 minute recipe videos, add subtitles, background music, and simple transitions. 2 videos per week.',
    category: 'Photography', location: 'Pune', budget: 4000, urgency: 'NORMAL',
  },
  {
    title: 'Personal Fitness Trainer — Weight Loss',
    description: 'Looking for a certified personal trainer to create a customized 3-month weight loss plan with workout and diet guidance. Sessions 4 days a week at home.',
    category: 'Fitness', location: 'Mumbai', budget: 6000, urgency: 'LOW',
  },
]

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationParticipant.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.review.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.serviceRequest.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data.')

  // Create skills
  const skills = await Promise.all(
    SKILLS_DATA.map((s) => prisma.skill.create({ data: s }))
  )
  console.log(`Created ${skills.length} skills.`)

  // Create users
  const passwordHash = await bcrypt.hash('Demo@1234', 12)
  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: {
          ...u,
          passwordHash,
          bio: `Experienced professional based in ${u.location}. Ready to help with various tasks.`,
        },
      })
    )
  )
  console.log(`Created ${users.length} users.`)

  // Assign random skills to users
  for (const user of users) {
    const randomSkills = skills.sort(() => Math.random() - 0.5).slice(0, 3)
    for (const skill of randomSkills) {
      await prisma.userSkill.create({
        data: { userId: user.id, skillId: skill.id, yearsExp: Math.floor(Math.random() * 5) + 1 },
      })
    }
  }
  console.log('Assigned skills to users.')

  // Create service requests
  const requests = await Promise.all(
    REQUESTS_DATA.map((r, i) =>
      prisma.serviceRequest.create({
        data: {
          ...r,
          urgency: r.urgency as 'LOW' | 'NORMAL' | 'URGENT' | 'TODAY',
          requesterId: users[i % users.length].id,
        },
      })
    )
  )
  console.log(`Created ${requests.length} service requests.`)

  // Create some offers
  const offerCount = Math.min(8, requests.length)
  for (let i = 0; i < offerCount; i++) {
    const request = requests[i]
    const provider = users[(i + 1) % users.length]
    if (provider.id === request.requesterId) continue

    await prisma.offer.create({
      data: {
        requestId: request.id,
        providerId: provider.id,
        amount: request.budget * 0.9,
        message: `I have relevant experience in this area and can complete this service efficiently. I am based in ${provider.location} and available at your convenience.`,
        estimatedTime: '2-3 hours',
        status: 'PENDING',
      },
    })

    await prisma.serviceRequest.update({
      where: { id: request.id },
      data: { status: 'OFFERS_RECEIVED' },
    })
  }
  console.log(`Created offers on ${offerCount} requests.`)

  console.log('\nSeed complete!')
  console.log('\nDemo accounts (password: Demo@1234):')
  USERS.forEach((u) => console.log(`  ${u.email}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
