import './scss/index.scss';
import { atom } from 'nanostores';

interface Company {
    id: number,
    company: string,
    logo: string,
    new: boolean,
    featured: boolean,
    position: string,
    role: string,
    level: string,
    postedAt: string,
    contract: string,
    location: string,
    languages: string,
    tools: string[]

}

const globals = {
    companies: atom([] as Company[]),
    filters: atom([] as string[])
}


const writeCompanies = () => {

    const companies = globals.companies.get()
    const filters = globals.filters.get()

    const filteredCompanies = !filters.length ? companies : companies.filter(company => {
        const arr = [company.role, company.level, ...company.languages]
        const filterSet = new Set<boolean>()
        filters.forEach(filter => {
            filterSet.add(arr.includes(filter))
        })

        return (filterSet.size === 1 && filterSet.has(true))
    })


    // Write the markup to the screen
    const jobsEl = document.querySelector('section#jobs ul')! as HTMLUListElement;
    const filtersEl = document.querySelector('section#filters ul')! as HTMLUListElement;
    const filtersSection = document.querySelector('section#filters')! as HTMLElement;
    const jobTemplate = document.querySelector('template#job')! as HTMLTemplateElement;
    const filterTemplate = document.querySelector('template#filter')! as HTMLTemplateElement;
    if (!(jobsEl && filtersEl)) return
    if (!filters.length) { filtersSection.setAttribute('aria-hidden', 'true') }
    else { filtersSection.removeAttribute('aria-hidden') }

    
    filtersEl.innerHTML = ``
    filters.forEach(filter => {
        const clone = filterTemplate.content.cloneNode(true)! as HTMLLIElement;
        clone.querySelector('span')!.innerText = filter
        filtersEl.appendChild(clone)
    })

    jobsEl.innerHTML = ``
    filteredCompanies.forEach(company => {
        const clone = jobTemplate.content.cloneNode(true)! as HTMLElement
        const arr = [company.role, company.level, ...company.languages]

        clone.querySelector('.job-filters')!.innerHTML = ``

        clone.querySelector('img')!.src = company.logo
        clone.querySelector('img')!.alt = company.company
        clone.querySelector('h2')!.textContent = company.company
        clone.querySelector('strong')!.textContent = company.position
        clone.querySelector('.job-info strong+div span:nth-child(1)')!.textContent = company.postedAt
        clone.querySelector('.job-info strong+div span:nth-child(2)')!.textContent = company.contract
        clone.querySelector('.job-info strong+div span:nth-child(3)')!.textContent = company.location


        arr.forEach(filter => {
            const li = document.createElement('li')
            const button = document.createElement('button')
            button.innerText = filter
            li.appendChild(button)
            clone.querySelector('.job-filters')!.appendChild(li) 
        })
        

        if (company.new) {
            const newEl = document.createElement('span')
            newEl.classList.add('new')
            newEl.textContent = 'NEW!'
            clone.querySelector('.job-info div:nth-child(1)')!.append(newEl)
        }

        if (company.featured) {
            const featuredEl = document.createElement('span')
            featuredEl.classList.add('featured')
            featuredEl.textContent = 'FEATURED'
            clone.querySelector('.job-info div:nth-child(1)')!.append(featuredEl)
            clone.querySelector('.job')!.classList.add('featured')
        }



        jobsEl.appendChild(clone)

        
    })


}





// Reactivity
globals.companies.subscribe(writeCompanies)
globals.filters.subscribe(writeCompanies)


// Setting Up Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const jobsEl = document.querySelector('section#jobs')! as HTMLElement
    const filtersSection = document.querySelector('section#filters')! as HTMLElement;

    jobsEl.addEventListener('click', e => {
        const el = e.target! as HTMLButtonElement
        if (!(el.tagName === 'BUTTON')) return

        const currentFilters = globals.filters.get()
        if (currentFilters.includes(el.innerText)) {
            globals.filters.set(currentFilters.filter(filter => filter !== el.innerText)) 
        }
        else {
            globals.filters.set([...currentFilters, el.innerText])
        }
         
    })



    filtersSection.addEventListener('click', e => {
        const el = e.target! as HTMLButtonElement
        if (!(el.tagName === 'BUTTON')) return

        if (el.title === 'Remove') { 
            const filter = el.parentElement?.querySelector('span')!.innerText
            const filters = globals.filters.get()
            globals.filters.set(filters.filter(filter_ => filter_ !== filter ))
        } else if (el.innerText === 'Clear') {
            globals.filters.set([])
        }
        
    })

})







const getData = async () => {
    const res = await fetch('./data.json')
    if (!res.ok) throw Error('404')

    const data = await res.json() as Company[]
    globals.companies.set(data)
}

getData()