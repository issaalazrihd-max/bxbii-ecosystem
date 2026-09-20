import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {const base="https://www.bxbii.com";const now=new Date();return[
{url:`${base}/`,lastModified:now,changeFrequency:"weekly",priority:1},
{url:`${base}/technology`,lastModified:now,changeFrequency:"weekly",priority:.95},
{url:`${base}/solutions`,lastModified:now,changeFrequency:"weekly",priority:.9},
{url:`${base}/industries`,lastModified:now,changeFrequency:"weekly",priority:.9},
{url:`${base}/rd`,lastModified:now,changeFrequency:"weekly",priority:.9},
{url:`${base}/about-us`,lastModified:now,changeFrequency:"monthly",priority:.8},
{url:`${base}/contact-us`,lastModified:now,changeFrequency:"monthly",priority:.8}
];}