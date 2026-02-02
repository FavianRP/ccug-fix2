import { Rss } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
  {/* Hero Section */}
<section className="relative min-h-screen flex items-center justify-center px-4">
  <div className="container mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center">
    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-6 sm:mb-8 italic">
      Cyber Community Universitas Gunadarma
    </h1>
    
    {/* Logo/Image */}
    <div className="flex justify-center mb-6 sm:mb-8">
      <div className="w-48 h-48 sm:w-64 sm:h-64 relative">
        <div className="w-full h-full rounded-lg overflow-hidden">
          <img 
            src="/img/ccug-gif.gif" 
            alt="Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
    
    <p className="text-sm sm:text-md md:text-xl text-ccug-gray mb-3 sm:mb-4">
      CTF Team Universitas Gunadarma
    </p>
    
    <h2 className="text-lg sm:text-xl md:text-2xl text-ccug-gray mb-6 sm:mb-8">
      Tim Akademik Universitas Gunadarma
    </h2>
    
    <p className="text-sm sm:text-base text-gray-400 mb-8 sm:mb-12 px-4">
      Contact us at{' '}
      <a 
        href="mailto:cycomug@gmail.com" 
        className="text-ccug-purple hover:underline break-all"
      >
        cycomug@gmail.com
      </a>
      {' '}(for business inquiries, event invitation, etc.)
    </p>
  </div>
</section>


{/* Content Section */}
<div id="about-section" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
  <div className="max-w-7xl mx-auto">
    {/* Section Header */}
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">About CCUG</h2>
      <Rss className="w-6 h-6 sm:w-8 sm:h-8 text-ccug-purple" />
    </div>

    <div className="border-b border-ccug-gray/50 mb-8 sm:mb-12"></div>

    {/* Gambar di tengah */}
    <div className="flex justify-center mb-8 sm:mb-12">
      <Image
        src="/img/CCUG_Logo_with_Text.png"
        alt="CCUG Team"
        width={200}
        height={100}
        className="rounded-lg object-cover w-40 sm:w-48 md:w-56 h-auto"
      />
    </div>

    <div className="space-y-6 sm:space-y-8 text-justify text-ccug-gray">
      <p className="text-base sm:text-lg leading-relaxed">
        Cyber Community Universitas Gunadarma (CCUG) pada awalnya didirikan oleh tiga mahasiswa Universitas Gunadarma pada bulan Mei 2017, 
        yaitu: Ravi Dharmawan (TI 2015), Muhammad Fadel Maulana (TI 2015), dan Jibril Hartri Putra (SI 2015). Keresahan Ravi, Fadel, dan 
        Jibril melihat kampus lain yang aktif mengikuti lomba keamanan siber CTF, membuat mereka berinisiatif untuk berpartisipasi pada 
        lomba CTF. Sejak saat itu, CCUG mulai terbentuk dan ikut aktif mengikuti perlombaan CTF nasional dan internasional.
      </p>

      <div className="flex justify-center mb-8 sm:mb-12">
        <Image
          src="/img/pendiri_dan_dosen.png"
          alt="CCUG Team"
          width={300}
          height={200}
          className="rounded-lg object-cover w-full sm:w-80 md:w-96 h-auto"
        />
      </div>

      <figcaption className="text-xs sm:text-sm leading-relaxed text-center text-ccug-gray">
        Pendiri CCUG & Dosen Pembimbing CCUG
      </figcaption>

      <p className="text-base sm:text-lg leading-relaxed">
        Sejak tim CCUG terbentuk, kami perlahan menjadi tim akademis resmi Universitas Gunadarma yang berfokus pada kompetisi keamanan siber. 
        Kami terdiri dari mahasiswa aktif Universitas Gunadarma dan dibimbing oleh Dr. Mochammad Akbar Marwan S.T., M.M.S.I.

      </p>

      <p className="text-base sm:text-lg leading-relaxed">
        Tidak ada kewajiban tiap anggota kami untuk berpartisipasi secara rutin kompetisi CTF, dan kami santai akan persaingan dengan tetap fokus belajar dan bersenang-senang. 
        Meskipun begitu, kami tetap serius ketika dalam kompetisi dan berlomba mendapatkan flag sebanyak-banyaknya!
        Pada kompetisi internasional, kami biasa bermain pada CTF yang tersedia di CTFTime, ranking internasional kami dapat diakses melalui
        <a href="https://ctftime.org/team/45168" className='text-ccug-purple'> ctftime.org.</a>
      </p>
    </div>

    <div className="border-b border-ccug-gray/50 my-8 sm:my-12"></div>
  </div>
</div>

    </div>
  );
}