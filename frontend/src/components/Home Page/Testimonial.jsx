import React from 'react'

const Testimonial = () => {
  return (
    <section className="relative isolate overflow-hidden bg-white px-6 mb-20 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <img className="mx-auto h-12 rounded-full" src="/src/assets/media/vglug-logo.png" alt="VGLUG Foundation" />
        <figure className="mt-10">
          <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
            <p>
              "Technology should be accessible to all — not just the privileged few. At VGLUG Foundation, we believe
              in empowering rural youth through Free and Open Source Software, bridging the digital divide one village
              at a time. Our mission is to liberate knowledge and nurture the next generation of innovators."
            </p>
          </blockquote>
          <figcaption className="mt-10">
            <img
              className="mx-auto h-10 w-10 rounded-full"
              src="https://ui-avatars.com/api/?name=Karkee+Udhayan&background=8b1a1a&color=fff&size=256&font-size=0.4&bold=true"
              alt="Karkee Udhayan"
            />
            <div className="mt-4 flex items-center justify-center space-x-3 text-base">
              <div className="font-semibold text-gray-900">Karkee Udhayan</div>
              <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <div className="text-gray-600">Prime Coordinator, VGLUG Foundation</div>
            </div>
          </figcaption>
        </figure>
      </div>
      <div className="mt-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Trusted by the FOSS community across India</p>
        <div className="mt-6 flex items-center justify-center gap-x-8 flex-wrap gap-y-4">
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">🐧 100+ Villages Reached</span>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">👨‍💻 1000+ Youth Trained</span>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">🌍 Since 2013</span>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">🔓 Open Source First</span>
        </div>
      </div>
    </section>
  )
}

export default Testimonial