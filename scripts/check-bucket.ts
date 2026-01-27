
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

async function checkBuckets() {
    console.log('Checking buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    console.log('Buckets found:', buckets);

    const photosBucket = buckets.find(b => b.name === 'photos');
    if (photosBucket) {
        console.log('Photos bucket details:', photosBucket);
        console.log('Is public:', photosBucket.public);

        // Check if we can list files
        const { data: files, error: listError } = await supabase.storage.from('photos').list();
        if (listError) {
            console.error('Error listing files in photos bucket:', listError);
        } else {
            console.log(`Found ${files.length} files in photos bucket.`);
            if (files.length > 0) {
                // Try to access the first file recursively if it's a folder
                // The upload path is `uploads/filename`.
                // .list() on root might return 'uploads' folder.

                // checking root items
                files.forEach(f => console.log('root item:', f));

                // Check inside 'uploads' if it exists
                const uploadFolder = files.find(f => f.name === 'uploads');
                if (uploadFolder) {
                    const { data: uploadFiles } = await supabase.storage.from('photos').list('uploads');
                    if (uploadFiles && uploadFiles.length > 0) {
                        const file = uploadFiles[0];
                        console.log('Checking file in uploads/:', file.name);
                        const { data } = supabase.storage.from('photos').getPublicUrl(`uploads/${file.name}`);
                        console.log('Sample public URL:', data.publicUrl);
                    }
                }
            }
        }
    } else {
        console.log('Photos bucket NOT found!');
    }
}

checkBuckets();
