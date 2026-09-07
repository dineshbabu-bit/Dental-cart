import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Dental Cart database seed...");

  // 1. Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.couponUsage.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.productSpecification.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.storeSettings.deleteMany({});

  // 2. Create Store Settings
  await prisma.storeSettings.create({
    data: {
      id: "default",
      businessName: "Dental Cart India Pvt. Ltd.",
      tagline: "Your Trusted Dental Supply Partner",
      email: "support@dentalcart.in",
      phone: "+91 98765 43210",
      address: "Unit 402, Dental Hub Plaza, Andheri East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400069",
      gstin: "27AABCB1234F1Z5",
      pan: "AABCB1234F",
      hsnDefault: "9018",
      currency: "INR",
      currencySymbol: "₹",
      taxCalculationMethod: "GST_STATE_BASED",
      enableRazorpay: true,
      enableUPI: true,
      enableCOD: true,
      freeShippingThreshold: 1500,
      defaultShippingFee: 99,
    },
  });

  // 3. Create Users
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const staffPassword = await bcrypt.hash("Staff@12345", 10);
  const customerPassword = await bcrypt.hash("Customer@12345", 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@dentalcart.in",
      password: adminPassword,
      name: "Dr. Rajesh Varma",
      phone: "+91 98201 12345",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@dentalcart.in",
      password: staffPassword,
      name: "Anil Deshmukh",
      phone: "+91 98202 23456",
      role: "STAFF",
      isActive: true,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "dr.sharma@dentalclinic.in",
      password: customerPassword,
      name: "Dr. Rohit Sharma",
      phone: "+91 98303 34567",
      role: "CUSTOMER",
      isActive: true,
      customerProfile: {
        create: {
          profession: "Dentist",
          clinicName: "Sharma Multispeciality Dental Clinic & Implant Centre",
          gstin: "27AAACS1234A1Z1",
          alternatePhone: "+91 98303 34568",
        },
      },
      addresses: {
        create: [
          {
            name: "Dr. Rohit Sharma",
            phone: "+91 98303 34567",
            street: "Shop 12, Ground Floor, Royal Arcade, SV Road, Bandra West",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400050",
            landmark: "Opposite Bandra Police Station",
            type: "CLINIC",
            isDefault: true,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "dr.priya@dentacare.com",
      password: customerPassword,
      name: "Dr. Priya Patel",
      phone: "+91 98404 45678",
      role: "CUSTOMER",
      isActive: true,
      customerProfile: {
        create: {
          profession: "Dental Clinic",
          clinicName: "DentaCare Orthodontics & Kids Dental Hospital",
          gstin: "24AAACD5678B1Z2",
          alternatePhone: "+91 98404 45679",
        },
      },
      addresses: {
        create: [
          {
            name: "Dr. Priya Patel",
            phone: "+91 98404 45678",
            street: "201, Shivalik High Street, CG Road, Navrangpura",
            city: "Ahmedabad",
            state: "Gujarat",
            pincode: "380009",
            landmark: "Near Law Garden",
            type: "CLINIC",
            isDefault: true,
          },
        ],
      },
    },
  });

  // 4. Create Categories
  const categoryData = [
    { name: "Dental Instruments", slug: "dental-instruments", description: "Mirrors, probes, tweezers, scalers, extraction forceps and diagnostic sets", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80", displayOrder: 1 },
    { name: "Dental Materials", slug: "dental-materials", description: "Composite resins, bonding agents, GIC, etching gels, and cavity liners", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80", displayOrder: 2 },
    { name: "Endodontics", slug: "endodontics", description: "Rotary & hand files, gutta-percha, apex locators, sealers, and paper points", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80", displayOrder: 3 },
    { name: "Orthodontics", slug: "orthodontics", description: "Brackets, archwires, buccal tubes, pliers, ligature ties, and aligner accessories", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80", displayOrder: 4 },
    { name: "Prosthodontics", slug: "prosthodontics", description: "Impression materials, alginate, silicone, dental stone, tray adhesives, and articulating papers", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80", displayOrder: 5 },
    { name: "Dental Implants", slug: "dental-implants", description: "Implants, abutments, surgical kits, torque wrenches, and bone graft materials", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80", displayOrder: 6 },
    { name: "Oral Surgery", slug: "oral-surgery", description: "Surgical elevators, bone rongers, suturing needles, blades, and surgical suction tips", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80", displayOrder: 7 },
    { name: "Preventive Dentistry", slug: "preventive-dentistry", description: "Fluoride varnishes, pit & fissure sealants, prophy pastes, and desensitizers", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80", displayOrder: 8 },
    { name: "Dental Consumables", slug: "dental-consumables", description: "Saliva ejectors, cotton rolls, micro-applicators, dental bibs, and mixing pads", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80", displayOrder: 9 },
    { name: "Infection Control", slug: "infection-control", description: "Autoclave pouches, surface disinfectants, enzymatic cleaners, and sterilization indicators", image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&auto=format&fit=crop&q=80", displayOrder: 10 },
    { name: "Dental Equipment", slug: "dental-equipment", description: "Curing lights, ultrasonic scalers, apex locators, micromotors, and amalgamators", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80", displayOrder: 11 },
    { name: "Handpieces", slug: "handpieces", description: "High-speed air turbines, contra-angle handpieces, straight handpieces, and lubrication sprays", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80", displayOrder: 12 },
    { name: "PPE", slug: "ppe", description: "Nitrile & latex gloves, 3-ply masks, face shields, surgical gowns, and head caps", image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&auto=format&fit=crop&q=80", displayOrder: 13 },
    { name: "Dental Accessories", slug: "dental-accessories", description: "Matrix bands, wedges, sectional matrix systems, polishing discs, and finishing strips", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80", displayOrder: 14 },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 5. Create Brands
  const brandData = [
    { name: "3M ESPE", slug: "3m-espe", logo: "/brands/3m.png", description: "Global pioneer in advanced dental composites, adhesives and impression materials." },
    { name: "Dentsply Sirona", slug: "dentsply-sirona", logo: "/brands/dentsply.png", description: "World's largest manufacturer of professional dental products and technologies." },
    { name: "Ivoclar Vivadent", slug: "ivoclar-vivadent", logo: "/brands/ivoclar.png", description: "Innovative materials and systems for high-quality restorative & prosthetic dentistry." },
    { name: "GC Dental", slug: "gc-dental", logo: "/brands/gc.png", description: "Leader in glass ionomer cements, restorative materials, and impression technology." },
    { name: "Mani", slug: "mani", logo: "/brands/mani.png", description: "Premium Japanese dental burs, rotary endodontic files, and micro instruments." },
    { name: "Kerr Dental", slug: "kerr-dental", logo: "/brands/kerr.png", description: "Total solutions in restorative composites, bonding agents, and endodontics." },
    { name: "Woodpecker", slug: "woodpecker", logo: "/brands/woodpecker.png", description: "Renowned manufacturer of high-tech ultrasonic scalers, curing lights, and apex locators." },
    { name: "Waldent", slug: "waldent", logo: "/brands/waldent.png", description: "Comprehensive range of reliable, cost-effective Indian dental instruments and supplies." },
    { name: "Septodont", slug: "septodont", logo: "/brands/septodont.png", description: "World leader in dental local anesthetics and bioceramic restorative materials." },
    { name: "API Dental", slug: "api-dental", logo: "/brands/api.png", description: "High-grade surgical stainless steel dental instruments made in India." },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandData) {
    const created = await prisma.brand.create({ data: b });
    brands[b.slug] = created;
  }

  // 6. Create Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Apex Dental Supplies Pvt Ltd",
      company: "Apex Healthcare & Dental Logistics",
      phone: "+91 11 2345 6789",
      email: "orders@apexdental.co.in",
      address: "Plot 45, Okhla Industrial Area Phase III, New Delhi 110020",
      gstin: "07AAACA1234F1Z9",
      isActive: true,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Medico India Distributors",
      company: "Medico Instruments & Consumables LLP",
      phone: "+91 22 8765 4321",
      email: "supply@medicoindia.in",
      address: "Building B, MIDC Cross Road 12, Andheri East, Mumbai 400093",
      gstin: "27AAACM9876C1Z3",
      isActive: true,
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "BioDent Pharma & Implants",
      company: "BioDent Surgicals India",
      phone: "+91 80 4123 9876",
      email: "sales@biodentsurgicals.com",
      address: "18, Peenya 2nd Stage, Bengaluru 560058",
      gstin: "29AAACB4567D1Z1",
      isActive: true,
    },
  });

  // 7. Create Products
  const products = [
    {
      name: "3M Filtek Z250 Universal Composite Restorative Syringe (4g)",
      slug: "3m-filtek-z250-composite-syringe-4g",
      sku: "3M-Z250-A2-4G",
      categoryId: categories["dental-materials"].id,
      brandId: brands["3m-espe"].id,
      supplierId: supplier1.id,
      description: "3M Filtek Z250 Universal Restorative is a trusted micro-hybrid composite with documented long-term clinical history. Indicated for both anterior and posterior restorations, core build-ups, and splinting. Features low shrinkage, excellent handling, high fracture toughness, and fast curing time (20 seconds).",
      shortDescription: "Universal micro-hybrid restorative composite (4g Syringe, Shade A2) for anterior and posterior fillings.",
      price: 1850.0,
      discountPrice: 1599.0,
      gstPercentage: 12.0,
      hsnCode: "30064000",
      stockQuantity: 85,
      minStockQuantity: 10,
      unit: "Syringe (4g)",
      batchNumber: "FLTK-2026-B84",
      expiryDate: new Date("2028-12-31"),
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 42,
      images: [
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Shade", value: "A2 (Universal Enamel)" },
        { key: "Curing Time", value: "20 seconds" },
        { key: "Volume", value: "4g Syringe" },
        { key: "Filler Type", value: "Micro-hybrid Zirconia/Silica" },
        { key: "Country of Origin", value: "USA" },
      ],
    },
    {
      name: "GC Gold Label Universal Restorative Glass Ionomer Cement (GIC 9 Extra)",
      slug: "gc-gold-label-9-extra-gic-restorative",
      sku: "GC-GIC9-15G",
      categoryId: categories["dental-materials"].id,
      brandId: brands["gc-dental"].id,
      supplierId: supplier1.id,
      description: "GC Gold Label Universal Restorative (Fuji IX Extra) is the packable posterior glass ionomer cement with smart fluoride release. Offers exceptional wear resistance, self-curing properties, chemical adhesion to enamel and dentin without etching, and superior translucency for aesthetic posterior fillings and pediatric dentistry.",
      shortDescription: "Packable self-cure glass ionomer cement kit (15g Powder + 6.4ml Liquid) with high fluoride release.",
      price: 2650.0,
      discountPrice: 2299.0,
      gstPercentage: 12.0,
      hsnCode: "30064000",
      stockQuantity: 42,
      minStockQuantity: 8,
      unit: "Kit (15g + 6.4ml)",
      batchNumber: "GC-GIC-7741",
      expiryDate: new Date("2028-09-30"),
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 28,
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Kit Components", value: "15g Powder + 6.4ml Liquid + Spoon + Mixing Pad" },
        { key: "Setting Type", value: "Chemical Self-Cure (Auto Cure)" },
        { key: "Shade", value: "A2 Universal" },
        { key: "Fluoride Release", value: "Ultra High Bio-Active Fluoride" },
      ],
    },
    {
      name: "Mani Rotary Endo Niti Super Files (Assorted SX-F3, 25mm)",
      slug: "mani-rotary-super-files-assorted-25mm",
      sku: "MANI-SF-ASST-25",
      categoryId: categories["endodontics"].id,
      brandId: brands["mani"].id,
      supplierId: supplier2.id,
      description: "Mani Rotary Super Files are engineered from premium heat-treated medical grade Nickel Titanium for superior flexibility and resistance to cyclic fatigue. Features progressively tapered flute design for efficient debris removal and smooth canal shaping. Pack of 6 assorted files (SX, S1, S2, F1, F2, F3).",
      shortDescription: "Premium Japanese NiTi Rotary canal shaping files (Pack of 6 Assorted Files, 25mm).",
      price: 1450.0,
      discountPrice: 1199.0,
      gstPercentage: 12.0,
      hsnCode: "90184900",
      stockQuantity: 120,
      minStockQuantity: 15,
      unit: "Pack of 6",
      batchNumber: "MNI-2026-X19",
      expiryDate: new Date("2029-06-30"),
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 65,
      images: [
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "File Length", value: "25mm" },
        { key: "Pack Size", value: "6 Files (SX, S1, S2, F1, F2, F3)" },
        { key: "Material", value: "Heat-treated NiTi Alloy" },
        { key: "Recommended RPM", value: "250 - 350 RPM" },
        { key: "Torque Limit", value: "1.5 - 3.0 N.cm" },
      ],
    },
    {
      name: "Woodpecker LED.B Cordless Dental Curing Light (1200 mW/cm²)",
      slug: "woodpecker-led-b-cordless-curing-light",
      sku: "WDP-LEDB-WHT",
      categoryId: categories["dental-equipment"].id,
      brandId: brands["woodpecker"].id,
      supplierId: supplier2.id,
      description: "Woodpecker LED.B is a high-performance cordless LED curing light offering constant light output of 1000-1200 mW/cm². Equipped with high-capacity rechargeable lithium-ion battery delivering over 400 cures of 10s on a single charge. Features 4 preset time modes (5s, 10s, 15s, 20s) and ergonomic wireless wand.",
      shortDescription: "Cordless LED light curing unit with 1200 mW/cm² output and high-capacity battery.",
      price: 4200.0,
      discountPrice: 3499.0,
      gstPercentage: 18.0,
      hsnCode: "90184900",
      stockQuantity: 34,
      minStockQuantity: 5,
      unit: "Piece",
      batchNumber: "WDP-2026-908",
      expiryDate: null,
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: false,
      rating: 4.7,
      reviewCount: 19,
      images: [
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Light Intensity", value: "1000 - 1200 mW/cm²" },
        { key: "Wavelength", value: "420nm - 480nm" },
        { key: "Battery Type", value: "Rechargeable Lithium Battery (1400mAh)" },
        { key: "Warranty", value: "1 Year Manufacturer Warranty" },
      ],
    },
    {
      name: "API Professional Diagnostic Set (Mirror, Probe, Tweezer, Explorer)",
      slug: "api-professional-diagnostic-set-4pcs",
      sku: "API-DIAG-SET4",
      categoryId: categories["dental-instruments"].id,
      brandId: brands["api-dental"].id,
      supplierId: supplier2.id,
      description: "API 4-Piece Dental Diagnostic Set crafted from AISI 420 medical grade German stainless steel. Includes Front Surface Mouth Mirror with Handle, Double-Ended Explorer Probe (DG16/Shepherd Hook), College Cotton Tweezer with Locking Pin, and Williams Periodontal Probe with millimeter markings. Fully autoclavable up to 134°C.",
      shortDescription: "4-piece premium autoclavable diagnostic examination set with German stainless steel.",
      price: 950.0,
      discountPrice: 799.0,
      gstPercentage: 12.0,
      hsnCode: "90184900",
      stockQuantity: 150,
      minStockQuantity: 20,
      unit: "Set of 4",
      batchNumber: "API-SS-2026-D4",
      expiryDate: null,
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 88,
      images: [
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Material", value: "AISI 420 Medical Grade Stainless Steel" },
        { key: "Contents", value: "Mouth Mirror, Explorer, College Tweezer, Williams Probe" },
        { key: "Autoclavable", value: "Yes (Up to 134°C / 273°F)" },
        { key: "Warranty", value: "5 Years Rust-Proof Guarantee" },
      ],
    },
    {
      name: "Waldent Premium Nitrile Medical Examination Gloves (Box of 100)",
      slug: "waldent-nitrile-examination-gloves-box-100",
      sku: "WAL-GLV-NIT-M",
      categoryId: categories["ppe"].id,
      brandId: brands["waldent"].id,
      supplierId: supplier2.id,
      description: "Waldent Medical Grade Powder-Free Nitrile Examination Gloves designed for dental and surgical clinical environments. Latex-free formula prevents Type I allergies. Textured fingertips ensure superior tactile sensitivity and strong grip in wet and dry procedures. Complies with EN 455 and ASTM D6319 standards.",
      shortDescription: "Latex-free, powder-free blue nitrile medical examination gloves (Medium, Box of 100).",
      price: 490.0,
      discountPrice: 380.0,
      gstPercentage: 5.0,
      hsnCode: "40151100",
      stockQuantity: 320,
      minStockQuantity: 40,
      unit: "Box of 100",
      batchNumber: "NIT-GLV-4402",
      expiryDate: new Date("2029-01-31"),
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 110,
      images: [
        "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Material", value: "100% Synthetic Nitrile Polymer" },
        { key: "Size", value: "Medium (Available in S, M, L)" },
        { key: "Color", value: "Cobalt Medical Blue" },
        { key: "Quantity", value: "100 Gloves per Dispenser Box" },
      ],
    },
    {
      name: "Septodont Septanest 1:100,000 Articaine Dental Cartridges (Box of 50)",
      slug: "septodont-septanest-articaine-box-50",
      sku: "SEPT-ART-100K",
      categoryId: categories["oral-surgery"].id,
      brandId: brands["septodont"].id,
      supplierId: supplier3.id,
      description: "Septanest (Articaine Hydrochloride 4% with Epinephrine 1:100,000) is the premier local anesthetic cartridge for dental infiltration and nerve block anesthesia. Known for fast onset (1-3 minutes) and profound pulpal anesthesia lasting 60-75 minutes. Siliconized stoppers for smooth, painless injection.",
      shortDescription: "Articaine 4% with Epinephrine 1:100,000 local anesthetic dental cartridges (Box of 50 x 1.7ml).",
      price: 2950.0,
      discountPrice: 2650.0,
      gstPercentage: 12.0,
      hsnCode: "30049000",
      stockQuantity: 58,
      minStockQuantity: 10,
      unit: "Box of 50",
      batchNumber: "SEPT-ART-2026-K9",
      expiryDate: new Date("2027-11-30"),
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 34,
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Active Ingredient", value: "Articaine HCl 40mg/ml + Epinephrine 0.01mg/ml" },
        { key: "Cartridge Size", value: "1.7ml Glass Cartridges" },
        { key: "Pack Size", value: "50 Cartridges in 5 Blister Trays" },
        { key: "Onset of Action", value: "1 - 3 minutes" },
      ],
    },
    {
      name: "3M Single Bond Universal Adhesive Bonding Agent (5ml Bottle)",
      slug: "3m-single-bond-universal-adhesive-5ml",
      sku: "3M-SBU-5ML",
      categoryId: categories["dental-materials"].id,
      brandId: brands["3m-espe"].id,
      supplierId: supplier1.id,
      description: "3M Single Bond Universal Adhesive is a single-bottle total-etch, self-etch, and selective-etch adhesive. Bonds to dentin, enamel, glass ceramics, zirconia, noble and non-precious alloys, and composites without an extra primer. Features virtually no post-operative sensitivity and MDP monomer formulation.",
      shortDescription: "Single-bottle universal multi-mode adhesive bonding agent (5ml Bottle) with MDP monomer.",
      price: 3450.0,
      discountPrice: 2999.0,
      gstPercentage: 12.0,
      hsnCode: "30064000",
      stockQuantity: 48,
      minStockQuantity: 8,
      unit: "Bottle (5ml)",
      batchNumber: "3M-SBU-8812",
      expiryDate: new Date("2028-05-31"),
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 52,
      images: [
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Etch Mode", value: "Total-Etch, Self-Etch, Selective-Etch" },
        { key: "Volume", value: "5ml Vial (approx. 200 drops)" },
        { key: "Bond Strength", value: "> 30 MPa on cut enamel & dentin" },
        { key: "Post-op Sensitivity", value: "Virtually 0%" },
      ],
    },
    {
      name: "Dentsply Sirona AH Plus Root Canal Sealer Kit (Paste A + B)",
      slug: "dentsply-ah-plus-root-canal-sealer-kit",
      sku: "DENT-AHPLUS-KIT",
      categoryId: categories["endodontics"].id,
      brandId: brands["dentsply-sirona"].id,
      supplierId: supplier1.id,
      description: "AH Plus is an epoxy amine resin-based root canal sealer offering outstanding radiopacity, low solubility, biocompatibility, and dimensional stability. Designed for permanent obturation of root canals with gutta-percha points. Features excellent flow characteristics and hermetic apical sealing.",
      shortDescription: "Epoxy resin permanent root canal sealer kit (4ml Paste A + 4ml Paste B).",
      price: 2850.0,
      discountPrice: 2490.0,
      gstPercentage: 12.0,
      hsnCode: "30064000",
      stockQuantity: 62,
      minStockQuantity: 10,
      unit: "Kit (Paste A + B)",
      batchNumber: "DNT-AHP-991",
      expiryDate: new Date("2028-04-30"),
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: false,
      rating: 4.9,
      reviewCount: 31,
      images: [
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Material Base", value: "Epoxy Amine Resin" },
        { key: "Setting Time", value: "8 hours at 37°C" },
        { key: "Radiopacity", value: "13.6 mm/mm Al" },
        { key: "Components", value: "4ml Tube A (Epoxide) + 4ml Tube B (Amine)" },
      ],
    },
    {
      name: "Ivoclar Tetric N-Ceram Bulk Fill Composite Syringe (3.5g)",
      slug: "ivoclar-tetric-n-ceram-bulk-fill-3-5g",
      sku: "IVOC-TETRIC-IVA-35",
      categoryId: categories["dental-materials"].id,
      brandId: brands["ivoclar-vivadent"].id,
      supplierId: supplier1.id,
      description: "Tetric N-Ceram Bulk Fill is a mouldable nano-hybrid composite for posterior restorations in increments up to 4mm. Features Ivocerin patented photo-initiator for deep polymerization in 10 seconds, low volumetric shrinkage, and stress reliever filler particles.",
      shortDescription: "4mm posterior bulk fill nano-hybrid composite resin (3.5g Syringe, Shade IVA).",
      price: 2150.0,
      discountPrice: 1850.0,
      gstPercentage: 12.0,
      hsnCode: "30064000",
      stockQuantity: 4, // Low stock demo!
      minStockQuantity: 10,
      unit: "Syringe (3.5g)",
      batchNumber: "IVO-TET-2026-88",
      expiryDate: new Date("2028-08-31"),
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      rating: 4.8,
      reviewCount: 15,
      images: [
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Increment Depth", value: "Up to 4mm in single layer" },
        { key: "Curing Time", value: "10 seconds (≥ 1000 mW/cm²)" },
        { key: "Shade", value: "IVA (Universal A Shade)" },
        { key: "Filler Content", value: "80% by weight" },
      ],
    },
    {
      name: "Waldent High-Speed Push Button Dental Air Turbine Handpiece",
      slug: "waldent-high-speed-air-turbine-handpiece",
      sku: "WAL-HP-AIR-PB",
      categoryId: categories["handpieces"].id,
      brandId: brands["waldent"].id,
      supplierId: supplier2.id,
      description: "Waldent Eco High Speed Push Button Air Turbine Handpiece with ceramic ball bearings for smooth, silent operation (>380,000 RPM). Features single water spray cooling system, standard head, stainless steel body, and standard 2-hole Bordon connector. Autoclavable at 135°C.",
      shortDescription: "Push button high-speed dental handpiece with ceramic bearings (2-Hole Bordon).",
      price: 1890.0,
      discountPrice: 1450.0,
      gstPercentage: 12.0,
      hsnCode: "90184900",
      stockQuantity: 28,
      minStockQuantity: 5,
      unit: "Piece",
      batchNumber: "WAL-HP-7091",
      expiryDate: null,
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      rating: 4.6,
      reviewCount: 45,
      images: [
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Speed", value: "350,000 - 420,000 RPM" },
        { key: "Chuck Type", value: "Push Button Chuck" },
        { key: "Connection", value: "Standard 2-Hole (Bordon)" },
        { key: "Bearings", value: "Japanese Ceramic Bearings" },
        { key: "Warranty", value: "6 Months Cartridge Warranty" },
      ],
    },
    {
      name: "Waldent Orthodontic MBT 022 Metal Brackets Set (20 Brackets/Set)",
      slug: "waldent-orthodontic-mbt-022-metal-brackets",
      sku: "WAL-ORTH-MBT022",
      categoryId: categories["orthodontics"].id,
      brandId: brands["waldent"].id,
      supplierId: supplier2.id,
      description: "Waldent MBT 0.022 Prescription Metal Orthodontic Brackets manufactured with MIM (Metal Injection Molding) technology for smooth contours and maximum patient comfort. 80-gauge mesh contoured base ensures superior bond strength to tooth enamel with easy debonding.",
      shortDescription: "MIM Metal MBT 0.022 slot orthodontic brackets with hooks on 3, 4, 5 (Set of 20).",
      price: 650.0,
      discountPrice: 480.0,
      gstPercentage: 12.0,
      hsnCode: "90184900",
      stockQuantity: 95,
      minStockQuantity: 15,
      unit: "Set of 20",
      batchNumber: "WAL-MBT-449",
      expiryDate: null,
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      rating: 4.7,
      reviewCount: 22,
      images: [
        "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Prescription", value: "Roth / MBT 0.022 Slot" },
        { key: "Hooks", value: "With Hooks on Cuspid & Bicuspid (3, 4, 5)" },
        { key: "Base", value: "80-gauge Mesh Bonding Base" },
        { key: "Manufacturing", value: "MIM (Metal Injection Molding)" },
      ],
    },
    {
      name: "Waldent Disposable Saliva Ejectors (Pack of 100)",
      slug: "waldent-disposable-saliva-ejectors-100pcs",
      sku: "WAL-SE-100CL",
      categoryId: categories["dental-consumables"].id,
      brandId: brands["waldent"].id,
      supplierId: supplier2.id,
      description: "Clear flexible saliva suction tips with smooth non-removable soft bonded tip for gentle suction without tissue aspirate trauma. Embedded copper wire retains desired shape when bent for customized patient comfort during restorative and prophylaxis procedures.",
      shortDescription: "Clear flexible suction tips with soft round bonded tip (Pack of 100).",
      price: 240.0,
      discountPrice: 190.0,
      gstPercentage: 12.0,
      hsnCode: "90184900",
      stockQuantity: 450,
      minStockQuantity: 50,
      unit: "Pack of 100",
      batchNumber: "WAL-SE-882",
      expiryDate: new Date("2030-01-01"),
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 74,
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Material", value: "Medical Grade PVC with Copper Core Wire" },
        { key: "Color", value: "Clear Transparent Body / Blue Tip" },
        { key: "Length", value: "150mm" },
        { key: "Pack Size", value: "100 Ejectors per Polybag" },
      ],
    },
    {
      name: "Waldent Autoclave Class B Sterilization Pouches (200 Pouches / Box)",
      slug: "waldent-autoclave-sterilization-pouches-box-200",
      sku: "WAL-POUCH-35X10",
      categoryId: categories["infection-control"].id,
      brandId: brands["waldent"].id,
      supplierId: supplier2.id,
      description: "Self-sealing autoclave pouches made with medical grade heavy kraft paper and multi-layer puncture-resistant laminated film. Features internal & external dual chemical indicators for steam and EtO gas sterilization. Extra wide 3-line seal prevents burst under pressure.",
      shortDescription: "Self-sealing medical grade autoclave pouches 3.5\" x 10\" (Box of 200).",
      price: 580.0,
      discountPrice: 460.0,
      gstPercentage: 12.0,
      hsnCode: "48194000",
      stockQuantity: 180,
      minStockQuantity: 25,
      unit: "Box of 200",
      batchNumber: "WAL-PCH-9918",
      expiryDate: new Date("2029-12-31"),
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      rating: 4.9,
      reviewCount: 36,
      images: [
        "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Dimensions", value: "3.5\" x 10\" (90mm x 260mm)" },
        { key: "Sterilization Modes", value: "Steam Autoclave & EtO Gas" },
        { key: "Sealing", value: "Self-Sealing Peel & Stick Adhesive Strip" },
      ],
    },
    {
      name: "API Dental Extraction Forceps Upper Anterior (Fig. 1)",
      slug: "api-extraction-forceps-upper-anterior-fig1",
      sku: "API-EXT-FIG1",
      categoryId: categories["dental-instruments"].id,
      brandId: brands["api-dental"].id,
      supplierId: supplier2.id,
      description: "API Figure 1 Upper Anterior Extraction Forceps designed for atraumatic extraction of maxillary central incisors, lateral incisors, and canines. Serrated diamond beak pattern ensures firm grip on tooth crown and root neck. Ergonomic handle with fine knurling prevents slippage.",
      shortDescription: "German stainless steel Upper Anterior extraction forceps (Fig. 1, Autoclavable).",
      price: 890.0,
      discountPrice: 720.0,
      gstPercentage: 12.0,
      hsnCode: "90184900",
      stockQuantity: 0, // Out of stock demo!
      minStockQuantity: 5,
      unit: "Piece",
      batchNumber: "API-FORC-101",
      expiryDate: null,
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      rating: 4.9,
      reviewCount: 27,
      images: [
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      ],
      specs: [
        { key: "Pattern", value: "English Pattern Fig. 1" },
        { key: "Indication", value: "Maxillary Incisors & Canines" },
        { key: "Material", value: "AISI 420 Medical Stainless Steel" },
      ],
    },
  ];

  for (const prod of products) {
    const { images, specs, ...data } = prod;
    const createdProduct = await prisma.product.create({
      data: {
        ...data,
        images: {
          create: images.map((url, idx) => ({
            url,
            isThumbnail: idx === 0,
            displayOrder: idx,
          })),
        },
        specifications: {
          create: specs.map((s) => ({
            key: s.key,
            value: s.value,
          })),
        },
      },
    });

    // Create initial stock transaction
    await prisma.inventoryTransaction.create({
      data: {
        productId: createdProduct.id,
        type: "IN",
        quantity: createdProduct.stockQuantity,
        previousStock: 0,
        newStock: createdProduct.stockQuantity,
        batchNumber: createdProduct.batchNumber,
        expiryDate: createdProduct.expiryDate,
        reason: "Initial Warehouse Stocking",
        createdById: superAdmin.id,
      },
    });
  }

  // 8. Create Coupons
  await prisma.coupon.create({
    data: {
      code: "WELCOME100",
      description: "Flat ₹100 Off on your first dental supplies order",
      discountType: "FIXED",
      discountValue: 100.0,
      minOrderValue: 500.0,
      maxDiscountValue: 100.0,
      validFrom: new Date(),
      validUntil: new Date("2029-12-31"),
      usageLimit: 500,
      isFirstOrderOnly: true,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "DENTAL10",
      description: "Get 10% Discount on orders above ₹2,000 (Max ₹1,000 Off)",
      discountType: "PERCENTAGE",
      discountValue: 10.0,
      minOrderValue: 2000.0,
      maxDiscountValue: 1000.0,
      validFrom: new Date(),
      validUntil: new Date("2029-12-31"),
      usageLimit: 1000,
      isFirstOrderOnly: false,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "CLINIC500",
      description: "Flat ₹500 Off on bulk clinic purchases above ₹5,000",
      discountType: "FIXED",
      discountValue: 500.0,
      minOrderValue: 5000.0,
      maxDiscountValue: 500.0,
      validFrom: new Date(),
      validUntil: new Date("2029-12-31"),
      usageLimit: 200,
      isFirstOrderOnly: false,
      isActive: true,
    },
  });

  // 9. Create Promotional Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "Grand Clinic Supply Festival",
        subtitle: "Up to 35% Off on 3M Restoratives, Mani NiTi Files & GC GIC Cements. 100% Genuine Supplies with GST Tax Invoices.",
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80",
        buttonText: "Explore Offers",
        buttonLink: "/products?discount=true",
        badge: "Limited Time Deal",
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "Next-Gen Endodontics Equipment",
        subtitle: "Upgrade your clinic with Woodpecker Apex Locators, Curing Lights, and Ultrasonic Scalers. Official 1-Year Warranty.",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&auto=format&fit=crop&q=80",
        buttonText: "Shop Equipment",
        buttonLink: "/products?category=dental-equipment",
        badge: "New Arrivals",
        displayOrder: 2,
        isActive: true,
      },
      {
        title: "Premium Diagnostic & Surgical Sets",
        subtitle: "Autoclavable AISI 420 German stainless steel instruments with 5-year rust-proof guarantee.",
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1600&auto=format&fit=crop&q=80",
        buttonText: "View Instruments",
        buttonLink: "/products?category=dental-instruments",
        badge: "Bestseller",
        displayOrder: 3,
        isActive: true,
      },
    ],
  });

  // 10. Create an initial sample Order & Invoice for Dr. Rohit Sharma
  const sampleProduct1 = await prisma.product.findUnique({ where: { sku: "3M-Z250-A2-4G" } });
  const sampleProduct2 = await prisma.product.findUnique({ where: { sku: "MANI-SF-ASST-25" } });

  if (sampleProduct1 && sampleProduct2) {
    const item1Total = (sampleProduct1.discountPrice || sampleProduct1.price) * 2; // 1599 * 2 = 3198
    const item2Total = (sampleProduct2.discountPrice || sampleProduct2.price) * 1; // 1199 * 1 = 1199
    const subtotal = item1Total + item2Total; // 4397
    const discount = 439.7; // 10% coupon
    const taxableAmount = subtotal - discount; // 3957.30
    const taxAmount = (taxableAmount * 0.12); // 474.88
    const cgst = taxAmount / 2; // 237.44 (Intra-state Maharashtra)
    const sgst = taxAmount / 2; // 237.44
    const shippingFee = 0; // Free shipping > 1500
    const grandTotal = Math.round(taxableAmount + taxAmount + shippingFee);

    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: "DC-2026-1001",
        userId: customer1.id,
        customerName: "Dr. Rohit Sharma",
        customerEmail: "dr.sharma@dentalclinic.in",
        customerPhone: "+91 98303 34567",
        clinicName: "Sharma Multispeciality Dental Clinic & Implant Centre",
        gstin: "27AAACS1234A1Z1",
        shippingAddressJson: JSON.stringify({
          name: "Dr. Rohit Sharma",
          phone: "+91 98303 34567",
          street: "Shop 12, Ground Floor, Royal Arcade, SV Road, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          landmark: "Opposite Bandra Police Station",
          type: "CLINIC",
        }),
        subtotal,
        discountAmount: discount,
        couponCode: "DENTAL10",
        taxAmount,
        cgst,
        sgst,
        igst: 0,
        shippingFee,
        grandTotal,
        paymentStatus: "SUCCESS",
        orderStatus: "PROCESSING",
        trackingNumber: "DELHIVERY-MH-994821",
        courierPartner: "Delhivery Express Healthcare",
        notes: "Deliver between 10am to 7pm at clinic reception.",
        items: {
          create: [
            {
              productId: sampleProduct1.id,
              productName: sampleProduct1.name,
              sku: sampleProduct1.sku,
              price: sampleProduct1.price,
              discountPrice: sampleProduct1.discountPrice,
              gstPercentage: sampleProduct1.gstPercentage,
              quantity: 2,
              total: item1Total,
              batchNumber: sampleProduct1.batchNumber,
              expiryDate: sampleProduct1.expiryDate,
            },
            {
              productId: sampleProduct2.id,
              productName: sampleProduct2.name,
              sku: sampleProduct2.sku,
              price: sampleProduct2.price,
              discountPrice: sampleProduct2.discountPrice,
              gstPercentage: sampleProduct2.gstPercentage,
              quantity: 1,
              total: item2Total,
              batchNumber: sampleProduct2.batchNumber,
              expiryDate: sampleProduct2.expiryDate,
            },
          ],
        },
        payment: {
          create: {
            paymentMethod: "UPI",
            transactionId: "UPI-IND-884920194820",
            amount: grandTotal,
            status: "SUCCESS",
            paymentDetailsJson: JSON.stringify({
              vpa: "dr.rohitsharma@okhdfcbank",
              bank: "HDFC Bank",
              timestamp: new Date().toISOString(),
            }),
          },
        },
        invoice: {
          create: {
            invoiceNumber: "INV-DC-2026-0001",
            invoiceDate: new Date(),
            subtotal,
            taxAmount,
            cgst,
            sgst,
            igst: 0,
            discountAmount: discount,
            grandTotal,
            businessDetailsJson: JSON.stringify({
              businessName: "Dental Cart India Pvt. Ltd.",
              tagline: "Your Trusted Dental Supply Partner",
              email: "support@dentalcart.in",
              phone: "+91 98765 43210",
              address: "Unit 402, Dental Hub Plaza, Andheri East, Mumbai 400069",
              gstin: "27AABCB1234F1Z5",
              pan: "AABCB1234F",
            }),
            customerDetailsJson: JSON.stringify({
              customerName: "Dr. Rohit Sharma",
              clinicName: "Sharma Multispeciality Dental Clinic & Implant Centre",
              gstin: "27AAACS1234A1Z1",
              phone: "+91 98303 34567",
              email: "dr.sharma@dentalclinic.in",
              billingAddress: "Shop 12, Ground Floor, Royal Arcade, SV Road, Bandra West, Mumbai 400050",
            }),
          },
        },
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: superAdmin.id,
        userName: superAdmin.name,
        userRole: superAdmin.role,
        action: "ORDER_STATUS_UPDATE",
        entity: "Order",
        entityId: sampleOrder.id,
        detailsJson: JSON.stringify({
          orderNumber: sampleOrder.orderNumber,
          previousStatus: "CONFIRMED",
          newStatus: "PROCESSING",
          trackingNumber: "DELHIVERY-MH-994821",
        }),
      },
    });

    // Create sample verified reviews
    await prisma.review.create({
      data: {
        productId: sampleProduct1.id,
        userId: customer1.id,
        rating: 5,
        title: "100% Genuine 3M Composite with long expiry!",
        comment: "Excellent handling, exact A2 shade matching and fast curing. Best price in India with valid GST bill for input tax credit.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    await prisma.review.create({
      data: {
        productId: sampleProduct2.id,
        userId: customer1.id,
        rating: 5,
        title: "Mani rotary files are extremely durable",
        comment: "Flawless canal shaping without file separation even in curved canals. Fast 2-day delivery to Mumbai.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    // Sample Notification
    await prisma.notification.create({
      data: {
        userId: customer1.id,
        roleTarget: "CUSTOMER",
        title: "Order #DC-2026-1001 is Processing",
        message: "Your dental supplies have been verified and packed. Delhivery tracking: DELHIVERY-MH-994821",
        type: "ORDER",
        link: `/account/orders/${sampleOrder.id}`,
      },
    });

    await prisma.notification.create({
      data: {
        roleTarget: "ADMIN",
        title: "New Clinic Order Received (#DC-2026-1001)",
        message: "Dr. Rohit Sharma placed an order for ₹4,432 (Paid via UPI).",
        type: "ORDER",
        link: `/admin/orders/${sampleOrder.id}`,
      },
    });
  }

  console.log("✅ Dental Cart database seeded successfully!");
  console.log("--------------------------------------------------");
  console.log("🔑 Super Admin: admin@dentalcart.in / Admin@12345");
  console.log("🔑 Staff:       staff@dentalcart.in / Staff@12345");
  console.log("🔑 Customer:    dr.sharma@dentalclinic.in / Customer@12345");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
