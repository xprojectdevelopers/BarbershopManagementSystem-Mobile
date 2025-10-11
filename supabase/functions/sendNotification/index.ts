console.log("Send Notification Function")

Deno.serve(async (req) => {
  console.log("User JWT:", req.headers.get('Authorization'));

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // For testing, skip auth check
  // const authHeader = req.headers.get('Authorization');
  // if (!authHeader) {
  //   return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
  //     status: 401,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  try {
    const { expoPushToken, title, body, data } = await req.json();

    if (!expoPushToken) {
      console.log('No expoPushToken provided, skipping notification send');
      return new Response(
         JSON.stringify({ success: false, skipped: true, message: 'No push token provided' }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const message = {
      to: expoPushToken,
      title: title || 'Notification',
      body: body || 'You have a new notification',
      data: data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify([message]),
    });

    const result = await response.json();

   if (!response.ok) {
      console.error('Expo API error:', result);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send notification' }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sendNotification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
     --data '{"expoPushToken":"ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]","title":"Test","body":"This is a test notification","data":{}}'

*/
