"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const api = axios_1.default.create({
    httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false })
});
async function test() {
    // Known active period (just a random active month, e.g. Oct 2025)
    // Wait, let's use recent dates to be sure.
    const formats = [
        { name: 'YYYY-MM-DD', fFrom: '2025-12-01', fTo: '2025-12-30' },
        { name: 'ISO', fFrom: '2025-12-01T00:00:00Z', fTo: '2025-12-30T00:00:00Z' },
        { name: 'US', fFrom: '12/01/2025', fTo: '12/30/2025' }
    ];
    for (const fmt of formats) {
        try {
            console.log(`Testing format: ${fmt.name}`);
            const url = `https://ocds-api.etenders.gov.za/api/OCDSReleases?PageNumber=1&PageSize=5&dateFrom=${fmt.fFrom}&dateTo=${fmt.fTo}`;
            console.log(`  GET ${url}`);
            const res = await api.get(url);
            console.log(`  Status: ${res.status}`);
            console.log(`  Data Type: ${typeof res.data}`);
            console.log(`  Data Keys: ${Object.keys(res.data).join(', ')}`);
            // console.log('  Sample:', JSON.stringify(res.data).substring(0, 200));
        }
        catch (e) {
            console.log(`  Error: ${e.message}`);
            if (e.response)
                console.log(`  Response: ${e.response.status} ${JSON.stringify(e.response.data)}`);
        }
        console.log('---');
    }
}
test();
