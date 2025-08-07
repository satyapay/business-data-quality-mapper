# Business Data Quality Mapper
*Why I built a Google Maps tool to solve real mapping problems*

## 🤔 The Story Behind This Project

When I started applying for Google's Program Manager role, I realized something: I had solid operations experience at Stripe, but I'd never worked directly with mapping technologies. Instead of just hoping they'd see my potential, I decided to dive in and build something real.

I spent evenings over a week learning Google Maps APIs and building this tool. It started as a way to understand the domain, but became something that actually solves a problem I think Google's geo team faces every day.

## 💡 What I Discovered (And Why It Matters)

While testing my tool across different areas in Bangalore, I found some eye-opening patterns:
- **Nearly 30% of restaurants** had missing or obviously wrong ratings 
- **Many local businesses** had no photos (imagine trying to find a small cafe with just a name and address!)
- **Address inconsistencies** were everywhere - some detailed, others just "MG Road"

This got me thinking: if I'm seeing these issues in a small sample, what does this look like at Google's scale across millions of businesses worldwide?

## 🛠️ What I Actually Built

I created a simple but effective tool that:

**Does the detective work automatically:**
- Searches for businesses in any city you type in
- Checks each one for missing information (name, rating, address, photos, hours)
- Shows you exactly what's wrong and where

**Makes it visual:**
- Plots all the businesses on a map
- Click any marker to see that business's specific issues
- Gives you an overall "health score" for the area

**Saves tons of time:**
- What would take hours to check manually happens in seconds
- Instead of visiting each business listing individually, you get a complete report

## 📊 The Numbers That Surprised Me

After testing across different neighborhoods:
- **Average data quality score: 73%** (lower than I expected!)
- **Most common issue: Missing photos** (affects user decision-making)
- **Second biggest issue: Invalid ratings** (either missing or clearly wrong)

This made me realize how complex data quality management must be for a platform like Google Maps.

## 🎯 Why This Actually Matters

**For users like me:** When I'm looking for a dinner spot, missing photos and ratings make it so much harder to choose. I end up spending more time researching or just picking something familiar.

**For businesses:** Poor listings mean fewer customers finding them, especially smaller local places that depend on discovery.

**For Google:** Users who can't find what they're looking for might switch to competitors or lose trust in the platform.

**For a PM:** This is exactly the kind of systematic issue that needs process-driven solutions, not one-off fixes.

## 🚀 What I Learned Building This

### Technical stuff:
- How Google's APIs actually work (and their limitations)

### Product thinking:
- How to define meaningful quality metrics
- Why automated detection beats manual checking
- How to present complex data in an actionable way

### Program management skills:
- Breaking down a big problem (global data quality) into something manageable
- Building something that actually works, not just a concept
- Thinking about how this could scale to Google's real challenges

## 🔧 How to Try It Yourself

### Google Maps API Configuration

Get your API key from: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=your_api_key_here

## 🔧 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/business-data-quality-mapper.git
   cd business-data-quality-mapper

2. **Get Google Maps API Key:**

Visit Google Cloud Console
Enable Maps JavaScript API, Places API, and Geocoding API
Create API key with appropriate restrictions

3. **Configure API Key:**

Open index.html
Replace YOUR_API_KEY with your actual API key
Save and open in browser

4. **Run the Application:**

Open index.html in any modern web browser
Enter a city name and click "Analyze Area"
Explore the quality assessment results!

**Now it's pretty straightforward:**
1. Open the `index.html` file in any browser
2. Type in a city name (I've been testing with "Bangalore" and "Mumbai")  
3. Click "Analyze Area" and watch it work
4. Click the map markers to see specific issues with each business

**Note:** You'll need a Google Maps API key, but the setup is simple.

## 🤯 What This Could Become

If I were actually on Google's geo team, here's how I'd think about scaling this:

**Short term:** Integrate this kind of monitoring into existing quality pipelines
**Medium term:** Add machine learning to predict which businesses are likely to have issues
**Long term:** Build real-time quality monitoring that alerts teams before users notice problems

## 💭 My Honest Reflection

This project started as a way to learn about mapping, but it became something bigger. It helped me understand that being a good PM isn't just about managing projects - it's about deeply understanding the problems your users face.

Every time I use Google Maps now, I notice things differently. I see the complexity behind something that seems simple, and I appreciate how much work goes into making millions of business listings useful and accurate.

**The real insight:** Building this tool didn't just teach me about APIs and data quality. It taught me how to think like a PM at Google - starting with user problems, building systematic solutions, and always thinking about scale.

## 📈 What the Data Actually Shows

| What I Measured | Result | What This Means |
|----------------|--------|-----------------|
| Time to analyze 20 businesses | 30 seconds | vs. 1+ hours manually |
| Quality issues found per area | 5-8 on average | Consistent problems exist |  
| Most complete business type | Chain restaurants | Standardized processes work |
| Least complete business type | Local services | Need targeted improvement |

---

**Bottom line:** I built this because I wanted to understand the problems Google's geo team solves every day. Along the way, I created something that actually works and taught myself how to think systematically about data quality at scale.

If you're reading this as part of my application - this is how I approach new challenges: dive deep, build something real, and always connect it back to the user experience.

*Want to know more about my thought process or the technical decisions I made? I'd love to walk through it in person.*


