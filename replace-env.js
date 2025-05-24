const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const filePath = path.join(__dirname, 'js', 'supabaseClient.js');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    return console.error('Error reading supabaseClient.js:', err);
  }

  let result = data.replace(/__SUPABASE_URL__/g, supabaseUrl);
  result = result.replace(/__SUPABASE_KEY__/g, supabaseKey);

  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) return console.error('Error writing supabaseClient.js:', err);
    console.log('Supabase keys injected into supabaseClient.js');
  });
});
