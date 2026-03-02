const people = [
  {
    name: 'Karkee Udhayan',
    role: 'Prime Coordinator & Co-Founder',
    imageUrl:
      'https://ui-avatars.com/api/?name=Karkee+Udhayan&background=8b1a1a&color=fff&size=256&font-size=0.4&bold=true',
  },
  {
    name: 'K Sathish Kumar',
    role: 'Coordinator & Trainer',
    imageUrl:
      'https://ui-avatars.com/api/?name=K+Sathish&background=a52a2a&color=fff&size=256&font-size=0.4&bold=true',
  },
  {
    name: 'K Vijayalakshmi',
    role: 'Coordinator & Software Engineer',
    imageUrl:
      'https://ui-avatars.com/api/?name=K+Vijayalakshmi&background=c0392b&color=fff&size=256&font-size=0.4&bold=true',
  },
  {
    name: 'Manimaran',
    role: 'Sr. Mobile App Developer & FOSS Contributor',
    imageUrl:
      'https://ui-avatars.com/api/?name=Manimaran&background=922b21&color=fff&size=256&font-size=0.4&bold=true',
  },
  {
    name: 'Haripriya',
    role: 'Co-Coordinator & Community Lead',
    imageUrl:
      'https://ui-avatars.com/api/?name=Haripriya&background=b03a2e&color=fff&size=256&font-size=0.4&bold=true',
  },
  {
    name: 'Khaleel',
    role: 'Speaker & Community Advocate',
    imageUrl:
      'https://ui-avatars.com/api/?name=Khaleel&background=943126&color=fff&size=256&font-size=0.4&bold=true',
  },
]

export default function Team() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Meet our leadership</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The VGLUG Foundation was founded in 2013 by a group of passionate engineers dedicated to promoting
            Free and Open Source Software (FOSS) and empowering rural communities through technology education
            across India.
          </p>
        </div>
        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {people.map((person) => (
            <li key={person.name}>
              <div className="flex items-center gap-x-6">
                <img className="h-16 w-16 rounded-full" src={person.imageUrl} alt={person.name} />
                <div>
                  <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">{person.name}</h3>
                  <p className="text-sm font-semibold leading-6 text-indigo-600">{person.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
