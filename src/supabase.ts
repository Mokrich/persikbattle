import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://usercvjjnighjnyfcmvp.supabase.co";
const supabaseAnonKey = "sb_publishable_oQE8HDegmBIpBHD0qlK1FQ_oM7ryAF1";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
