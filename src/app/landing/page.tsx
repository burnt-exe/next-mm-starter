"use client";
import { Box, VStack, Text } from "@chakra-ui/react";
import Hero from "./Hero";
import Features from "./Features";
import CTA from "./CTA";
import Navbar from "./Navbar"; // Relative Path
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <Box>
      <Navbar />
      <VStack spacing={10} py={8}>
        <Hero />
        <Features />
        <CTA />
      </VStack>
      <Footer />
    </Box>
  );
}
