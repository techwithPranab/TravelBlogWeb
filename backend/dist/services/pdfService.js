"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PDFDocument = require('pdfkit');
class PDFService {
    /**
     * Generate PDF for itinerary
     */
    async generateItineraryPDF(itinerary) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                // Header
                this.addHeader(doc, itinerary);
                // Trip Overview
                this.addTripOverview(doc, itinerary);
                // Day Plans
                this.addDayPlans(doc, itinerary);
                // Accommodations
                if (itinerary.accommodationSuggestions?.length > 0) {
                    this.addAccommodations(doc, itinerary);
                }
                // Restaurants
                if (itinerary.restaurantRecommendations?.length > 0) {
                    this.addRestaurants(doc, itinerary);
                }
                // Transportation Tips
                if (itinerary.transportationTips?.length > 0) {
                    this.addTransportation(doc, itinerary);
                }
                // Budget Breakdown
                if (itinerary.budgetBreakdown) {
                    this.addBudgetBreakdown(doc, itinerary);
                }
                // General Tips
                if (itinerary.generalTips?.length > 0) {
                    this.addGeneralTips(doc, itinerary);
                }
                // Packing List
                if (itinerary.packingList?.length > 0) {
                    this.addPackingList(doc, itinerary);
                }
                // Footer
                this.addFooter(doc);
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    addHeader(doc, itinerary) {
        doc
            .fontSize(24)
            .fillColor('#4F46E5')
            .text(itinerary.title || 'Travel Itinerary', { align: 'center' })
            .moveDown(0.5);
        doc
            .fontSize(12)
            .fillColor('#6B7280')
            .text(`Generated on ${new Date(itinerary.createdAt).toLocaleDateString()}`, { align: 'center' })
            .moveDown(1.5);
        // Draw separator line
        doc
            .strokeColor('#E5E7EB')
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke()
            .moveDown(1);
    }
    addTripOverview(doc, itinerary) {
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .text('Trip Overview', { underline: true })
            .moveDown(0.5);
        const overview = [
            ['From:', itinerary.source],
            ['To:', itinerary.destinations.join(' → ')],
            ['Duration:', `${itinerary.duration} days`],
            ['Travel Mode:', itinerary.travelMode.toUpperCase()],
            ['Budget:', itinerary.budget.charAt(0).toUpperCase() + itinerary.budget.slice(1)],
            ['Travel Style:', itinerary.travelStyle.charAt(0).toUpperCase() + itinerary.travelStyle.slice(1)],
            ['Travelers:', `${itinerary.adults} adult(s)${itinerary.children ? `, ${itinerary.children} child(ren)` : ''}`],
            ['Total Cost:', `${itinerary.currencySymbol || '₹'}${itinerary.totalEstimatedCost?.toLocaleString() || 'N/A'}`]
        ];
        doc.fontSize(11).fillColor('#374151');
        overview.forEach(([label, value]) => {
            doc
                .font('Helvetica-Bold')
                .text(label, { continued: true })
                .font('Helvetica')
                .text(` ${value}`);
        });
        doc.moveDown(1.5);
    }
    addDayPlans(doc, itinerary) {
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('Daily Itinerary', { underline: true })
            .moveDown(0.5);
        itinerary.dayPlans?.forEach((day, index) => {
            // Check if we need a new page
            if (doc.y > 650) {
                doc.addPage();
            }
            doc
                .fontSize(14)
                .fillColor('#4F46E5')
                .font('Helvetica-Bold')
                .text(`Day ${day.day || index + 1}: ${day.destination || itinerary.destinations[0]}`)
                .moveDown(0.3);
            if (day.theme) {
                doc
                    .fontSize(11)
                    .fillColor('#6B7280')
                    .font('Helvetica-Oblique')
                    .text(`Theme: ${day.theme}`)
                    .moveDown(0.3);
            }
            // Activities
            if (day.activities && Array.isArray(day.activities)) {
                day.activities.forEach((activity, actIndex) => {
                    doc
                        .fontSize(11)
                        .fillColor('#374151')
                        .font('Helvetica-Bold')
                        .text(`${activity.time || `Activity ${actIndex + 1}`}`, { continued: true })
                        .font('Helvetica')
                        .text(` - ${activity.activity || activity.place || activity.name || 'Activity'}`);
                    if (activity.description) {
                        doc
                            .fontSize(10)
                            .fillColor('#6B7280')
                            .text(`   ${activity.description}`, { indent: 10 });
                    }
                    if (activity.cost || activity.estimatedCost) {
                        doc
                            .fontSize(10)
                            .fillColor('#059669')
                            .text(`   Cost: ${itinerary.currencySymbol || '₹'}${activity.cost || activity.estimatedCost}`, { indent: 10 });
                    }
                    doc.moveDown(0.3);
                });
            }
            doc.moveDown(0.5);
        });
        doc.moveDown(1);
    }
    addAccommodations(doc, itinerary) {
        if (doc.y > 600)
            doc.addPage();
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('Accommodation Suggestions', { underline: true })
            .moveDown(0.5);
        itinerary.accommodationSuggestions.forEach((acc) => {
            doc
                .fontSize(12)
                .fillColor('#4F46E5')
                .font('Helvetica-Bold')
                .text(acc.name || 'Accommodation')
                .fontSize(10)
                .fillColor('#374151')
                .font('Helvetica')
                .text(`Type: ${acc.type || 'Hotel'} | Price Range: ${acc.priceRange}`);
            if (acc.location) {
                doc.text(`Location: ${acc.location}`);
            }
            if (acc.amenities && acc.amenities.length > 0) {
                doc.text(`Amenities: ${acc.amenities.join(', ')}`);
            }
            if (acc.description) {
                doc
                    .fontSize(10)
                    .fillColor('#6B7280')
                    .text(acc.description, { indent: 10 });
            }
            doc.moveDown(0.5);
        });
        doc.moveDown(1);
    }
    addRestaurants(doc, itinerary) {
        if (doc.y > 600)
            doc.addPage();
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('Restaurant Recommendations', { underline: true })
            .moveDown(0.5);
        itinerary.restaurantRecommendations.forEach((rest) => {
            doc
                .fontSize(12)
                .fillColor('#4F46E5')
                .font('Helvetica-Bold')
                .text(rest.name || 'Restaurant')
                .fontSize(10)
                .fillColor('#374151')
                .font('Helvetica')
                .text(`Cuisine: ${Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : rest.cuisine || 'Various'} | Price Range: ${rest.priceRange}`);
            if (rest.location) {
                doc.text(`Location: ${rest.location}`);
            }
            if (rest.specialties && rest.specialties.length > 0) {
                doc.text(`Specialties: ${rest.specialties.join(', ')}`);
            }
            if (rest.description) {
                doc
                    .fontSize(10)
                    .fillColor('#6B7280')
                    .text(rest.description, { indent: 10 });
            }
            doc.moveDown(0.5);
        });
        doc.moveDown(1);
    }
    addTransportation(doc, itinerary) {
        if (doc.y > 600)
            doc.addPage();
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('Transportation Tips', { underline: true })
            .moveDown(0.5);
        doc.fontSize(10).fillColor('#374151').font('Helvetica');
        itinerary.transportationTips.forEach((tip) => {
            const tipText = typeof tip === 'string' ? tip : tip.tip || tip.description || '';
            doc.text(`• ${tipText}`, { indent: 10 });
            doc.moveDown(0.3);
        });
        doc.moveDown(1);
    }
    addBudgetBreakdown(doc, itinerary) {
        if (doc.y > 600)
            doc.addPage();
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('Budget Breakdown', { underline: true })
            .moveDown(0.5);
        doc.fontSize(11).fillColor('#374151').font('Helvetica');
        const budget = itinerary.budgetBreakdown;
        const currencySymbol = itinerary.currencySymbol || '₹';
        if (budget.accommodation) {
            doc.text(`Accommodation: ${currencySymbol}${budget.accommodation.toLocaleString()}`);
        }
        if (budget.food) {
            doc.text(`Food: ${currencySymbol}${budget.food.toLocaleString()}`);
        }
        if (budget.transportation) {
            doc.text(`Transportation: ${currencySymbol}${budget.transportation.toLocaleString()}`);
        }
        if (budget.activities) {
            doc.text(`Activities: ${currencySymbol}${budget.activities.toLocaleString()}`);
        }
        if (budget.miscellaneous) {
            doc.text(`Miscellaneous: ${currencySymbol}${budget.miscellaneous.toLocaleString()}`);
        }
        doc
            .moveDown(0.5)
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#059669')
            .text(`Total: ${currencySymbol}${itinerary.totalEstimatedCost?.toLocaleString() || 'N/A'}`);
        doc.moveDown(1);
    }
    addGeneralTips(doc, itinerary) {
        if (doc.y > 600)
            doc.addPage();
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('General Tips', { underline: true })
            .moveDown(0.5);
        doc.fontSize(10).fillColor('#374151').font('Helvetica');
        itinerary.generalTips.forEach((tip) => {
            doc.text(`• ${tip}`, { indent: 10 });
            doc.moveDown(0.3);
        });
        doc.moveDown(1);
    }
    addPackingList(doc, itinerary) {
        if (doc.y > 600)
            doc.addPage();
        doc
            .fontSize(16)
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text('Packing List', { underline: true })
            .moveDown(0.5);
        doc.fontSize(10).fillColor('#374151').font('Helvetica');
        itinerary.packingList.forEach((item) => {
            doc.text(`☐ ${item}`, { indent: 10 });
            doc.moveDown(0.3);
        });
        doc.moveDown(1);
    }
    addFooter(doc) {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc
                .fontSize(8)
                .fillColor('#9CA3AF')
                .text(`Generated by TravelBlog AI | Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
        }
    }
}
exports.default = new PDFService();
