"use client"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CloudIcon, MapPinIcon, ThermometerIcon, SearchIcon, LoaderIcon } from "lucide-react"

interface WeatherData {
  temperature: number
  description: string
  location: string
  unit: string
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedLocation = location.trim()
    if (trimmedLocation === "") {
      setError("Please enter a valid location.")
      setWeather(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`,
      )
      if (!response.ok) {
        throw new Error("City not found")
      }
      const data = await response.json()
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      }
      setWeather(weatherData)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("City not found. Please try again.")
      setWeather(null)
    } finally {
      setIsLoading(false)
    }
  }

  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0) {
        return `It's freezing at ${temperature}°C! Bundle up!`
      } else if (temperature < 10) {
        return `It's quite cold at ${temperature}°C. Wear warm clothes.`
      } else if (temperature < 20) {
        return `The temperature is ${temperature}°C. Comfortable for a light jacket.`
      } else if (temperature < 30) {
        return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`
      } else {
        return `It's hot at ${temperature}°C. Stay hydrated!`
      }
    } else {
      return `${temperature}°${unit}`
    }
  }

  function getWeatherMessage(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny":
        return "It's a beautiful sunny day!"
      case "partly cloudy":
        return "Expect some clouds and sunshine."
      case "cloudy":
        return "It's cloudy today."
      case "overcast":
        return "The sky is overcast."
      case "rain":
        return "Don't forget your umbrella! It's raining."
      case "thunderstorm":
        return "Thunderstorms are expected today."
      case "snow":
        return "Bundle up! It's snowing."
      case "mist":
        return "It's misty outside."
      case "fog":
        return "Be careful, there's fog outside."
      default:
        return description
    }
  }

  function getLocationMessage(location: string): string {
    const currentHour = new Date().getHours()
    const isNight = currentHour >= 18 || currentHour < 6
    return `${location} ${isNight ? "at Night" : "During the Day"}`
  }

  function getWeatherTheme(description: string) {
    const desc = description.toLowerCase()
    if (desc.includes("sunny") || desc.includes("clear")) {
      return "from-yellow-400 via-orange-400 to-red-400"
    } else if (desc.includes("rain") || desc.includes("drizzle")) {
      return "from-gray-400 via-blue-500 to-blue-600"
    } else if (desc.includes("snow")) {
      return "from-blue-100 via-blue-200 to-blue-300"
    } else if (desc.includes("cloud")) {
      return "from-gray-300 via-gray-400 to-gray-500"
    } else if (desc.includes("thunder")) {
      return "from-gray-700 via-gray-800 to-gray-900"
    } else {
      return "from-blue-400 via-blue-500 to-blue-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Weather Widget
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                Discover current weather conditions in any city worldwide
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter a city name..."
                    value={location}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                    className="pl-10 h-12 text-sm md:text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center animate-in slide-in-from-top-2 duration-300">
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {weather && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div
                    className={`rounded-2xl p-6 bg-gradient-to-r ${getWeatherTheme(weather.description)} text-white shadow-lg`}
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">{weather.location}</h3>
                      <div className="text-5xl font-bold mb-2">
                        {weather.temperature}°{weather.unit}
                      </div>
                      <p className="text-lg opacity-90">{weather.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        <ThermometerIcon className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                          {getTemperatureMessage(weather.temperature, weather.unit)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        <CloudIcon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                          {getWeatherMessage(weather.description)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        <MapPinIcon className="w-8 h-8 mx-auto mb-3 text-green-600" />
                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                          {getLocationMessage(weather.location)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {!weather && !error && !isLoading && (
                <div className="text-center py-12">
                  <CloudIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Enter a city name to get started</p>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}
