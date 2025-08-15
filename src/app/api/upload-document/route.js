// app/api/upload-document/route.js
export async function POST(req) {
  try {
    const body = await req.json();

    // Get the user's token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: "No token provided" }), {
        status: 401,
      });
    }

    const supabaseResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-document`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader, // <-- use the token sent from client
        },
        body: JSON.stringify(body),
      }
    );

    const data = await supabaseResponse.json();

    return new Response(JSON.stringify(data), {
      status: supabaseResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
    });
  }
}
