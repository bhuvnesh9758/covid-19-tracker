import React ,{useState,useEffect} from 'react'
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map'
import Table from './Table';
import {sortData,prettyPrintStat} from './util'
import LineGraph from './LineGraph';

function App() {
  const [countries, setCountries] = useState([])  
  const [country,setCountry]=useState("worldwide")
  const [countryInfo,setCountryInfo]=useState({})
  const [tableData,setTableData]=useState([])
  const [mapCenter, setMapCenter] = useState({
    lat:34.80746,lng:-40.4696
  })
  const [mapZoom,setMapZoom]=useState(3)
  const [mapCountries,setMapCountries]=useState([])
  const[casesType,setCasesType]=useState("cases")

  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
    .then(data=>data.json())
    .then(data=>setCountryInfo(data))
  },[])
  useEffect(()=>{
    const getCountriesList=async ()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then(data =>data.json())
      .then(data=>{
        const countries=data.map(country=>({
          name:country.country,
          value:country.countryInfo.iso2
        }))
        const sortedData=sortData(data)
        setTableData(sortedData)
        setCountries(countries)
        setMapCountries(data)
      })
    }
    getCountriesList()
  },[])
  const onCountryChange=async (e)=>{
    const countryCode=e.target.value
    const url=countryCode==='worldwide'?'https://disease.sh/v3/covid-19/all':`https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
    .then(data=>data.json())
    .then(data=>{
      setCountry(countryCode)
      setCountryInfo(data)
      setMapCenter([data.countryInfo.lat,data.countryInfo.long])
      setMapZoom(4)
      console.log(countryInfo)
    })
  }
  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
    <h1>Covid Tracker</h1>
    <FormControl className="app__dropdown">
    <Select
    variant="outlined"
    value={country}
    onChange={onCountryChange}
    >
      <MenuItem value="worldwide">Worldwide</MenuItem>
    {
      countries.map(data=>{
        return <MenuItem value={data.value}>{data.name}</MenuItem>
      })
    }
    </Select>
    </FormControl>
    </div>
    <div className="app__stats">
      {/* Cases boc */}
      <InfoBox isRed active={casesType==="cases"} onClick={e=>setCasesType("cases")} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>
      <InfoBox active={casesType==="recovered"} onClick={e=>setCasesType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
      <InfoBox  isRed active={casesType==="deaths"} onClick={e=>setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
    </div>
    <Map casesType={casesType} countries={mapCountries} zoom={mapZoom} center={mapCenter}/>
      </div>
      <Card className="app__right" >
        <CardContent >
          <h3>Live Cases By Country</h3>
          <Table countries={tableData}/>
          <h3 className="app__graphTitle">Worlwide New {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
    );
  }
  
  export default App;
  