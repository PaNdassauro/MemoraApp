
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload...');
    const fileName = `test-${Date.now()}.txt`;
    const fileContent = 'Hello World';
    const filePath = `uploads/${fileName}`;

    // 1. Upload
    const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, fileContent, {
            contentType: 'text/plain',
            upsert: false
        });

    if (error) {
        console.error('Upload FAILED:', error);
        return;
    }
    console.log('Upload SUCCESS:', data);

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    // 3. Try to fetch it
    try {
        const res = await fetch(publicUrl);
        console.log('Fetch Status:', res.status);
        if (res.ok) {
            console.log('Fetch content:', await res.text());
            console.log('Bucket is PUBLIC.');
        } else {
            console.log('Fetch FAILED. Bucket is likely PRIVATE.');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }

    // 4. Try Signed URL
    const { data: signedData, error: signedError } = await supabase.storage
        .from('photos')
        .createSignedUrl(filePath, 60);

    if (signedError) {
        console.error('Signed URL Error:', signedError);
    } else {
        console.log('Signed URL:', signedData.signedUrl);
        const resSigned = await fetch(signedData.signedUrl);
        console.log('Fetch Signed Status:', resSigned.status);
        if (resSigned.ok) {
            console.log('Signed URL works!');
        }
    }
}

testUpload();
