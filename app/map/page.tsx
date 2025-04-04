"use client";
import Image from "next/image";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox GL CSS
import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl"; // Import Mapbox GL
import { useSearchParams, useRouter } from "next/navigation"; // You need to use 'next/navigation' for the App Router in Next.js 13
import axios from "axios";
import { myAppHook } from "../../context/AppProvider"; // Ensure this path is correct
import EditSchoolForm from "../../components/EditSchoolForm"; // Import the new component
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Checkbox } from "../../components/ui/checkbox"
import Table from "../../components/Table"; // Import the new Table component
import { SchoolType } from "../../types/SchoolType"; // Import the shared SchoolType interface
import { Paginator } from "../../types/Paginator"; // Import the shared Paginator interface
import {
  Accordion,
  AccordionContent,
AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import Link from "next/link";
import SearchForm from "../../components/searchForm";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""; // Set Mapbox access token

const Schools: React.FC = () => {
  const { authToken } = myAppHook();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams ? searchParams.get("page") : null;
  const [searchQuery, setSearchQuery] = useState<string | null>(searchParams?.get("query") || ""); // Initialize searchQuery from URL
  const [schools, setSchools] = useState<{ data: SchoolType[]; paginator: Paginator }>({
    data: [],
    paginator: {
      current_page: 1,
      last_page: 1,
      links: [],
      total: 0,
      per_page: 10,
      from: 0,
      to: 0,
    },
  });
  const [formData, setFormData] = useState<SchoolType>({
    school_id: 0,
    id: "",
    uprn: 0,
    establishment_name: "",
    address: "",
    street: "",
    locality: "",
    address3: "",
    town: "",
    establishment_type_group: "",
    phase_of_education: "",
    featured_image: "",
    la_name: "",
    establishment_number: "",
    establishment_status: "",
    statutory_low_age: "",
    statutory_high_age: "",
    boarders: "",
    nursery_provision: "",
    official_sixth_form: "",
    gender: "",
    religious_character: "",
    religious_ethos: "",
    admissions_policy: "",
    school_capacity: "",
    special_classes: "",
    census_date: "",
    number_of_pupils: "",
    number_of_boys: "",
    number_of_girls: "",
    percentage_fsm: "",
    trust_school_flag: "",
    school_sponsor_flag: "",
    federation_flag: "",
    federations: "",
    ukprn: "",
    ofsted_last_insp: "",
    ofsted_special_measures: "",
    last_changed_date: "",
    county: "",
    postcode: "",
    school_website: "",
    telephone_number: "",
    head_title: "",
    head_first_name: "",
    head_last_name: "",
    head_preferred_job_title: "",
    sen1: "",
    sen2: "",
    sen3: "",
    sen4: "",
    type_of_resourced_provision: "",
    resourced_provision_on_roll: "",
    resourced_provision_capacity: "",
    sen_unit_on_roll: "",
    sen_unit_capacity: "",
    gor: "",
    district_administrative: "",
    administrative_ward: "",
    parliamentary_constituency: "",
    urban_rural: "",
    easting: "",
    northing: "",
    msoa: "",
    lsoa: "",
    ofsted_rating: "",
    country: "",
    vote_ratio: "",
    vote_total: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the map container
  const mapRef = useRef<mapboxgl.Map | null>(null); // Ref to store the map instance
  const leftPaneRef = useRef<HTMLDivElement | null>(null); // Ref for the right pane
  const rightPaneRef = useRef<HTMLDivElement | null>(null); // Ref for the right pane
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(false); // State to track left pane visibility
  const [isRightPaneOpen, setIsRightPaneOpen] = useState(true); // State to track right pane visibility
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null); // State to store the selected school

  const [status, setStatus] = useState<{
    Open: boolean;
    Closed: boolean;
  }>({
    Open: true,
    Closed: false,
  });

  const [filters, setFilters] = useState<{
    Nursery: boolean;
    Primary: boolean;
    Secondary: boolean;
    "Not applicable": boolean;
    Other: boolean;
  }>({
    Nursery: true,
    Primary: true,
    Secondary: true,
    "Not applicable": true,
    Other: true,
  });

  const handleEstStatusChange = (state: keyof typeof status) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [state]: !prevStatus[state],
    }));
  };
  
  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  useEffect(() => {
    if (!authToken) {
      console.log("Redirecting to /auth due to missing authToken");
      router.replace("/auth");
    }
  }, [authToken, router]); // Add router as a dependency

  useEffect(() => {
    fetchAllSchools(page ?? "1"); // Fetch schools whenever page or searchQuery changes
  }, [authToken, page, searchQuery]); // Add searchQuery as a dependency

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current, // Map container
        style: "mapbox://styles/mapbox/streets-v11", // Map style
        center: [-0.1276, 51.5072], // Initial map center [lng, lat] (e.g., London)
        zoom: 10, // Initial zoom level
      });

      mapRef.current = map; // Store the map instance in the ref

      map.on("load", () => {
        // Add the source for the school layer
        map.addSource("schools", {
          type: "vector",
          url: "mapbox://jbiddulph.schools", // Tileset ID
        });

        // Add a layer to display circles for the school locations
        map.addLayer({
          id: "school-circles",
          type: "circle",
          source: "schools",
          "source-layer": "schools", // Layer name in the Tileset
          paint: {
            "circle-radius": 9, // Circle size
            "circle-color": [
              "case",
              ["all", ["==", ["get", "establishment_status"], "Open"], status.Open],
              [
                "match",
                ["get", "phase_of_education"], // Get the phase_of_education property
                "Nursery", filters.Nursery ? "#FFDE21" : "transparent", // Yellow for Nursery
                "Primary", filters.Primary ? "#007cbf" : "transparent", // Blue for Primary
                "Secondary", filters.Secondary ? "#800080" : "transparent", // Purple for Secondary
                "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent", // Pink for Not applicable
                filters.Other ? "#666666" : "transparent", // Default color (gray) for other values
              ],
              ["all", ["==", ["get", "establishment_status"], "Closed"], status.Closed],
              [
                "match",
                ["get", "phase_of_education"], // Get the phase_of_education property
                "Nursery", filters.Nursery ? "#FFDE21" : "transparent", // Yellow for Nursery
                "Primary", filters.Primary ? "#007cbf" : "transparent", // Blue for Primary
                "Secondary", filters.Secondary ? "#800080" : "transparent", // Purple for Secondary
                "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent", // Pink for Not applicable
                filters.Other ? "#666666" : "transparent", // Default color (gray) for other values
              ],
              "transparent", // Default to transparent if establishment_status is not visible
            ],
          },
        }); // Add dependencies to re-render the layer when filters or status change

        // Add popup functionality
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        // Mouseenter event to show popup
        map.on("mouseenter", "school-circles", (e) => {
          map.getCanvas().style.cursor = "pointer";

          const coordinates = e.lngLat;
          const properties = e.features?.[0]?.properties;

          if (properties) {
            popup
              .setLngLat(coordinates)
              .setHTML(`
                <div>
                  <strong>${properties.establishment_name}</strong><br />
                  ${properties.street || ""} ${properties.locality || ""}<br />
                  ${properties.town || ""}
                </div>
              `)
              .addTo(map);
          }
        });

        // Mouseout event to hide popup
        map.on("mouseout", "school-circles", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });

        // Add click event to open the left pane and show school details
        map.on("click", "school-circles", (e) => {
          const properties = e.features?.[0]?.properties;
          const coordinates = e.lngLat;

          console.log("Feature properties on click:", properties); // Log all properties for debugging

          if (properties) {
            const school_id = properties?.school_id ?? 0; // Ensure school_id is a number, default to 0 if undefined
            const schoolId = properties.id; // Ensure this matches the correct `id` field
            const establishmentName = properties.establishment_name; // Get the establishment name
            console.log("Selected School ID (UUID):", schoolId);
            setSelectedSchool({
              school_id: school_id,
              id: schoolId, // Use the correct `id` field
              establishment_name: properties.establishment_name,
              street: properties.street,
              locality: properties.locality,
              town: properties.town,
              establishment_type_group: properties.establishment_type_group,
              phase_of_education: properties.phase_of_education,
              address: properties.address,
              address3: properties.address3,
              administrative_ward: properties.administrative_ward,
              admissions_policy: properties.admissions_policy,
              boarders: properties.boarders,
              census_date: properties.census_date,
              county: properties.county,
              country: properties.country,
              district_administrative: properties.district_administrative,
              establishment_number: properties.establishment_number,
              federation_flag: properties.federation_flag,
              federations: properties.federations,
              gender: properties.gender,
              gor: properties.gor,
              number_of_boys: properties.number_of_boys,
              number_of_girls: properties.number_of_girls,
              number_of_pupils: properties.number_of_pupils,
              head_first_name: properties.head_first_name,
              head_last_name: properties.head_last_name,
              head_preferred_job_title: properties.head_preferred_job_title,
              head_title: properties.head_title,
              la_name: properties.la_name,
              last_changed_date: properties.last_changed_date,
              lsoa: properties.lsoa,
              msoa: properties.msoa,
              nursery_provision: properties.nursery_provision,
              official_sixth_form: properties.official_sixth_form,
              ofsted_last_insp: properties.ofsted_last_insp,
              ofsted_rating: properties.ofsted_rating,
              ofsted_special_measures: properties.ofsted_special_measures,
              parliamentary_constituency: properties.parliamentary_constituency,
              percentage_fsm: properties.percentage_fsm,
              postcode: properties.postcode,
              religious_character: properties.religious_character,
              religious_ethos: properties.religious_ethos,
              resourced_provision_capacity: properties.resourced_provision_capacity,
              resourced_provision_on_roll: properties.resourced_provision_on_roll,
              school_capacity: properties.school_capacity,
              school_sponsor_flag: properties.school_sponsor_flag,
              school_website: properties.school_website,
              sen1: properties.sen1,
              sen2: properties.sen2,
              sen3: properties.sen3,
              sen4: properties.sen4,
              sen_unit_capacity: properties.sen_unit_capacity,
              sen_unit_on_roll: properties.sen_unit_on_roll,
              special_classes: properties.special_classes,
              statutory_high_age: properties.statutory_high_age,
              statutory_low_age: properties.statutory_low_age,
              telephone_number: properties.telephone_number,
              trust_school_flag: properties.trust_school_flag,
              type_of_resourced_provision: properties.type_of_resourced_provision,
              ukprn: properties.ukprn,
              uprn: properties.uprn,
              urban_rural: properties.urban_rural,
              vote_ratio: properties.vote_ratio,
              vote_total: properties.vote_total,
            });
            fetchSchoolPhoto(schoolId); // Fetch the photo for the selected school
            toggleLeftPane(); // Open the left pane
            handleLocationSelection(schoolId, coordinates, establishmentName); // Pass the name to the popup
          }
        });
      });

      return () => map.remove(); // Cleanup map instance on component unmount
    }
  }, []); // Only run on mount

  useEffect(() => {
    const map = mapRef.current; // Access the map instance from the ref
    if (map && map.getLayer("school-circles")) {
      map.setPaintProperty("school-circles", "circle-color", [
        "case",
        ["all", ["==", ["get", "establishment_status"], "Open"], status.Open],
        [
          "match",
          ["get", "phase_of_education"],
          "Nursery", filters.Nursery ? "#FFDE21" : "transparent",
          "Primary", filters.Primary ? "#007cbf" : "transparent",
          "Secondary", filters.Secondary ? "#800080" : "transparent",
          "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent",
          filters.Other ? "#666666" : "transparent",
        ],
        ["all", ["==", ["get", "establishment_status"], "Closed"], status.Closed],
        [
          "match",
          ["get", "phase_of_education"],
          "Nursery", filters.Nursery ? "#FFDE21" : "transparent",
          "Primary", filters.Primary ? "#007cbf" : "transparent",
          "Secondary", filters.Secondary ? "#800080" : "transparent",
          "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent",
          filters.Other ? "#666666" : "transparent",
        ],
        "transparent",
      ]);
    }
  }, [filters, status]); // Update when filters or status change

  const fetchSchoolPhoto = async (schoolId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/school/photo`,
        {
          params: { id: schoolId }, // ✅ Send ID as query parameter
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      if (response.data.photo_url) {
        setSelectedSchool((prev) => {
          if (!prev) return null; // Handle the case where prev is null
          return {
            ...prev,
            featured_image: response.data.photo_url,
          };
        });
      } else {
        console.warn("No photo URL returned for the school.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching school photo:", error.response || error.message);
      } else {
        console.error("Error fetching school photo:", error);
      }
      toast.error("Failed to fetch school photo.");
    }
  };
  

  const fetchAllSchools = async (page: string | number) => {
    try {
      let response;

      if (searchQuery) {
        // Use POST request for search queries
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/schools/search`,
          { query: searchQuery, page }, // Include searchQuery and page in the body
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      } else {
        // Use GET request for all schools
        response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/schools`,
          {
            params: { page }, // Only include page if no searchQuery
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      }

      setSchools({
        data: response.data.schools.data,
        paginator: response.data.schools,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching schools:", error.response || error.message);
      } else {
        console.error("Error fetching schools:", error);
      }
      toast.error("Failed to fetch schools.");
    }
  };

  const handleEditClick = (school: SchoolType) => {
    setFormData({
      ...school,
      id: String(school.id || ""), // Ensure id is explicitly cast to a string
    });
    console.log("formData after setting in handleEditClick:", formData); // Log the form data
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setFormData({
      school_id: 0,
      id: "",
      uprn: 0,
      establishment_name: "",
      address: "",
      street: "",
      locality: "",
      address3: "",
      town: "",
      establishment_type_group: "",
      phase_of_education: "",
      featured_image: "",
      la_name: "",
      establishment_number: "",
      establishment_status: "",
      statutory_low_age: "",
      statutory_high_age: "",
      boarders: "",
      nursery_provision: "",
      official_sixth_form: "",
      gender: "",
      religious_character: "",
      religious_ethos: "",
      admissions_policy: "",
      school_capacity: "",
      special_classes: "",
      census_date: "",
      number_of_pupils: "",
      number_of_boys: "",
      number_of_girls: "",
      percentage_fsm: "",
      trust_school_flag: "",
      school_sponsor_flag: "",
      federation_flag: "",
      federations: "",
      ukprn: "",
      ofsted_last_insp: "",
      ofsted_special_measures: "",
      last_changed_date: "",
      county: "",
      postcode: "",
      school_website: "",
      telephone_number: "",
      head_title: "",
      head_first_name: "",
      head_last_name: "",
      head_preferred_job_title: "",
      sen1: "",
      sen2: "",
      sen3: "",
      sen4: "",
      type_of_resourced_provision: "",
      resourced_provision_on_roll: "",
      resourced_provision_capacity: "",
      sen_unit_on_roll: "",
      sen_unit_capacity: "",
      gor: "",
      district_administrative: "",
      administrative_ward: "",
      parliamentary_constituency: "",
      urban_rural: "",
      easting: "",
      northing: "",
      msoa: "",
      lsoa: "",
      ofsted_rating: "",
      country: "",
      vote_ratio: "",
      vote_total: "",
    });
    setIsEditing(false);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log("FormData being sent: ", formData);
      console.log("isEditing: ", isEditing);
  
      if (isEditing) {
        // Ensure formData.id exists for PUT request
        if (!formData.id) {
          console.error("School ID is missing.");
          toast.error("School ID is required for editing.");
          return;
        }
  
        // Edit School
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/schools/${formData.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        toast.success(response.data.message);
        if (response.data.status) {
          console.log("Success Response: ", response.data);
          fetchAllSchools(page ?? "1");
          handleCloseModal();
        } else {
          toast.error(response.data.message || "Something went wrong.");
        }
      } else {
        // Add School
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/schools`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        if (response.data.status) {
          console.log("Success Response: ", response.data);
          fetchAllSchools(page ?? "1");
          handleCloseModal();
        } else {
          toast.error(response.data.message || "Something went wrong.");
        }
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("An error occurred while submitting the form.");
    }
  };  

  const toggleLeftPane = () => {
    if (leftPaneRef.current) {
      if (isLeftPaneOpen) {
        leftPaneRef.current.style.transform = "translateX(-100%)"; // Slide out
        // Hide the overlay when the left pane is closed
        document.getElementById("mapOverlay")?.classList.add("hidden");
      } else {
        leftPaneRef.current.style.transform = "translateX(0)"; // Slide in
        // Show the overlay when the left pane is open
        document.getElementById("mapOverlay")?.classList.remove("hidden");
      }
      setIsLeftPaneOpen(!isLeftPaneOpen);
    }
  };

  const toggleRightPane = () => {
    if (rightPaneRef.current && mapContainerRef.current && mapRef.current) {
      // Toggle the pane state
      setIsRightPaneOpen(!isRightPaneOpen);

      if (isRightPaneOpen) {
        // Close the right pane
        rightPaneRef.current.style.display = "none"; // Hide the right pane
        mapContainerRef.current.style.flex = "1"; // Make the map container take full width
      } else {
        // Open the right pane
        rightPaneRef.current.style.display = "block"; // Show the right pane
        mapContainerRef.current.style.flex = "2"; // Reset the map container to 2/3 width
      }

      // Notify Mapbox of the size change
      setTimeout(() => {
        mapRef.current?.resize();
      }, 300); // Delay to match the CSS transition duration
    }
  };

  let activePopup: mapboxgl.Popup | null = null; // Track the active popup

  const handleLocationSelection = (schoolId: string, coordinates: mapboxgl.LngLat, establishmentName: string) => {
    const map = mapRef.current;
    if (map && map.getLayer("school-circles")) {
      // Filter to show only the selected school
      map.setFilter("school-circles", ["==", ["get", "id"], schoolId]);

      // Remove any existing popup
      if (activePopup) {
        activePopup.remove();
      }

      // Create a new popup and store it in `activePopup`
      activePopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "z-[110]", // Add a high z-index to ensure it appears above the overlay
      })
        .setLngLat(coordinates)
        .setHTML(`<div><strong>${establishmentName}</strong></div>`) // Display the school's name
        .addTo(map);
    }
  };

  const closePanes = () => {
    if (isLeftPaneOpen) {
      toggleLeftPane(); // Close the left pane
      resetLocationFilter(); // Reset the filter to show all locations

      // Remove the active popup
      if (activePopup) {
        activePopup.remove(); // Remove the popup from the map
        activePopup = null; // Clear the reference to the popup
      }
    }
    if (isRightPaneOpen) {
      toggleRightPane(); // Close the right pane
    }
  };

  const resetLocationFilter = () => {
    const map = mapRef.current;
    if (map && map.getLayer("school-circles")) {
      map.setFilter("school-circles", null); // Reset the filter to show all schools
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/schools/search`,
        { query },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("Search response:", response.data);
      setSchools({
        data: response.data.schools.data,
        paginator: response.data.schools,
      });
      setSearchQuery(query); // Update searchQuery state
      router.push(`/map?page=1&query=${encodeURIComponent(query)}`); // Update URL with query
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <>
      <div className="bg-white shadow-md w-full flex" style={{ height: "calc(100vh - 60px)" }}>
        {/* Left Pane */}
        <div
          id="leftPane"
          ref={leftPaneRef}
          className="z-[100] fixed top-[60px] left-0 h-full w-3/4 md:w-1/3 bg-white shadow-md transition-transform duration-300 ease-in-out transform -translate-x-full"
        >
          {selectedSchool && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedSchool.establishment_name}</h3>
                <h4>{selectedSchool.phase_of_education}</h4>
              </div>
              <div>
              <button
                onClick={closePanes}
                className="text-xs bg-red-700 text-white px-2 py-1 rounded shadow-md hover:bg-red-600 transition"
              >
                X
              </button>
              </div>
            </div>
              <div className="mt-4 overflow-y-auto scrollable h-[90vh]">
                <p>{selectedSchool.head_title} {selectedSchool.head_first_name} {selectedSchool.head_last_name} - {selectedSchool.head_preferred_job_title}</p>
                {(
                  selectedSchool.street ||
                  selectedSchool.address ||
                  selectedSchool.address3 ||
                  selectedSchool.town ||
                  selectedSchool.postcode ||
                  selectedSchool.county ||
                  selectedSchool.country
                ) && (
                  <h3 className="text-md font-semibold mt-2">
                    {selectedSchool.street && `${selectedSchool.street}, `}
                    {selectedSchool.address && `${selectedSchool.address}, `}
                    {selectedSchool.address3 && `${selectedSchool.address3}, `}
                    {selectedSchool.town && `${selectedSchool.town}, `}
                    {selectedSchool.postcode && `${selectedSchool.postcode}, `}
                    {selectedSchool.county && `${selectedSchool.county} `}
                    {selectedSchool.country && selectedSchool.country}
                  </h3>
                )}
                {(selectedSchool.ofsted_last_insp || selectedSchool.ofsted_rating) && (
                  <>
                    <div className="bg-blue-500 w-100 h-6 mx-auto">
                      <h3 className="text-md font-semibold mt-2 pt-1 text-center text-sm text-white">
                        {selectedSchool.ofsted_rating} | {selectedSchool.ofsted_last_insp}
                      </h3>
                    </div>
                  </>
                )}
                <hr className="h-2 bg-red-700 mb-4" />
                <div className="pb-[100px] overflow-y-auto scrollable">
                  <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Statistics</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex justify-evenly mb-4 text-center">
                          <span>Girls: <br /><span className="font-bold">{selectedSchool.number_of_girls}</span></span>
                          <span>Boys: <br /><span className="font-bold">{selectedSchool.number_of_boys}</span></span>
                          <span>Pupils: <br /><span className="font-bold">{selectedSchool.number_of_pupils}</span></span>
                          <span>Gender: <br /><span className="font-bold">{selectedSchool.gender}</span></span>
                        </div>
                        <div className="flex justify-evenly mb-4 text-center">
                          <span>Capacity: <br /><span className="font-bold">{selectedSchool.school_capacity}</span></span>
                          <span>High Age: <br /><span className="font-bold">{selectedSchool.statutory_high_age}</span></span>
                          <span>Low Age: <br /><span className="font-bold">{selectedSchool.statutory_low_age}</span></span>
                        </div>
                        {/* Conditionally display Ofsted info */}
                        {(selectedSchool.ofsted_last_insp || selectedSchool.ofsted_rating || selectedSchool.ofsted_special_measures) && (
                          <>
                            <div className="flex flex-col justify-evenly mb-4">
                              {selectedSchool.ofsted_rating && <span>Ofsted Rating: <span className="font-bold">{selectedSchool.ofsted_rating}</span></span>}
                              {selectedSchool.ofsted_last_insp && <span>Last Inspected: <span className="font-bold">{selectedSchool.ofsted_last_insp}</span></span>}
                              {selectedSchool.ofsted_special_measures && <span>Special Measures: <span className="font-bold">{selectedSchool.ofsted_special_measures}</span></span>}
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Local Contact Info</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4">
                          <Link
                            href={selectedSchool?.school_website || '/'}
                            target="_blank"
                            className="text-blue-500 hover:underline">{selectedSchool.school_website}</Link>
                          <p>Locality: {selectedSchool.locality}</p>
                          <p>Telephone: {selectedSchool.telephone_number}</p>
                          <p>District: {selectedSchool.district_administrative}</p>
                          <p>LA: {selectedSchool.la_name}</p>
                          <p>Administrative Ward: Tarring</p>
                          <p>Locality: {selectedSchool.locality}</p>
                          <p>LSOA: {selectedSchool.lsoa}</p>
                          <p>MSOA: {selectedSchool.msoa}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Useful Info</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4">
                        <p>Type: {selectedSchool.establishment_type_group}</p>
                        <p>Administrative Ward: {selectedSchool.administrative_ward}</p>
                        <p>Admissions Policy: {selectedSchool.admissions_policy}</p>
                        <p>Boarders: {selectedSchool.boarders}</p>
                        <p>Federations Flag: {selectedSchool.federation_flag}</p>
                        <p>Federations: {selectedSchool.federations}</p>
                        <p>Gor: {selectedSchool.gor}</p>
                        <p>Nursery Provision: {selectedSchool.nursery_provision}</p>
                        <p>Official Sixth Form: {selectedSchool.official_sixth_form}</p>
                        <p>Parliamentary Constituency: {selectedSchool.parliamentary_constituency}</p>
                        <p>FSM %: {selectedSchool.percentage_fsm}</p>
                        <p>Religous Character: {selectedSchool.religious_character}</p>
                        <p>Religious Ethos: {selectedSchool.religious_ethos}</p>
                        <p>Resourced Provision Capacity: {selectedSchool.resourced_provision_capacity}</p>
                        <p>Resourced Provision On Roll: {selectedSchool.resourced_provision_on_roll}</p>
                        <p>School Sponsor Flag: {selectedSchool.school_sponsor_flag}</p>
                        <p>Sen1: {selectedSchool.sen1}</p>
                        <p>Sen2: {selectedSchool.sen2}</p>
                        <p>Sen3: {selectedSchool.sen3}</p>
                        <p>Sen4: {selectedSchool.sen4}</p>
                        <p>Sen Unit Capacity: {selectedSchool.sen_unit_capacity}</p>
                        <p>Sen Unit On Roll: {selectedSchool.sen_unit_on_roll}</p>
                        <p>Special Classes: {selectedSchool.special_classes}</p>
                        <p>Trust School Flag: {selectedSchool.trust_school_flag}</p>
                        <p>Type of Resourced Provision: {selectedSchool.type_of_resourced_provision}</p>
                        <p>Urban Rural: {selectedSchool.urban_rural}</p>
                        <p>Vote Ratio: {selectedSchool.vote_ratio}</p>
                        <p>Vote Total: {selectedSchool.vote_total}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Other Info</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4">
                          <p>School ID: {selectedSchool.school_id}</p>
                          <p>Est No.: {selectedSchool.establishment_number}</p>
                          <p>UKPRN: {selectedSchool.ukprn}</p>
                          <p>UPRN: {selectedSchool.uprn}</p>
                          <p>Census: {selectedSchool.census_date}</p>
                          <p>ID: {selectedSchool.id}</p>
                          <p>Last changed: {selectedSchool.last_changed_date}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>School Image</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4">
                        {selectedSchool.featured_image && (
                          <Image
                            height={300}
                            width={300}
                            src={selectedSchool.featured_image}
                            alt={selectedSchool.establishment_name}
                            className="mt-4 w-full h-auto"
                          />
                        )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
          </div>   
        )}
        </div>
        {/* Map and Right Pane Container */}
        <div className="flex flex-1 relative">
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="h-full transition-all duration-300 ease-in-out relative"
            style={{
              flex: isRightPaneOpen ? "2" : "1", // Dynamically adjust flex based on isRightPaneOpen
              zIndex: 0, // Ensure the map has a lower z-index
            }}
          />
          {/* Overlay Div */}
          <div
            id="mapOverlay"
            className="hidden absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
            onClick={closePanes} // Add click event to close panes
          ></div>
            {/* Toggle Button */}
            <button
              onClick={toggleRightPane}
              className="border z-20 fixed -right-[6px] top-1/2 transform -translate-y-1/2 bg-yellow-500 text-white px-3 py-2 rounded shadow-md hover:bg-blue-600 transition"
            >
              {isRightPaneOpen ? "→" : "←"}
            </button>
          {/* Right Pane */}
          <div
            id="rightPane"
            ref={rightPaneRef}
            className={`relative p-6 transition-transform duration-300 ease-in-out h-full bg-white shadow-md`}
            style={{
              flex: "1", // Fixed width for the right pane
              display: isRightPaneOpen ? "block" : "none", // Hide or show the pane
            }}
          >
            <Tabs defaultValue="account" className="w-100 h-100">
              <TabsList>
                <TabsTrigger value="account">Filters</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <div className="mb-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Phase of Education</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-4 flex-col md:flex-row">
                          {(["Nursery", "Primary", "Secondary", "Not applicable", "Other"] as Array<keyof typeof filters>).map((filter) => (
                              <label key={filter} className="flex items-center gap-2">
                              <Checkbox 
                                  checked={filters[filter]}
                                  onCheckedChange={() => handleFilterChange(filter)}
                              />
                              {filter}
                              </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Establishment Status</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-4 flex-col md:flex-row">
                          {(["Open", "Closed"] as Array<keyof typeof status>).map((state) => (
                              <label key={state} className="flex items-center gap-2">
                              <Checkbox 
                                  checked={status[state]}
                                  onCheckedChange={() => handleEstStatusChange(state)}
                              />
                              {state}
                              </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="flex items-end justify-between mb-4">
                  <SearchForm onSearch={handleSearch} />
                </div>
                <Table
                  schools={schools.data}
                  paginator={schools.paginator}
                  handleEditClick={handleEditClick}
                  isAdmin={myAppHook().isAdmin} // Pass isAdmin to the Table component
                  searchQuery={searchQuery || undefined} // Pass searchQuery to the Table component
                />
              </TabsContent>
            </Tabs>
            {/* <Drawer>
              <DrawerTrigger>Open</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <div>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer> */}
          </div>
        </div>
      </div>

      {/* EditSchoolForm Modal */}
      {showEditModal && (
        <EditSchoolForm
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          handleFormSubmit={handleFormSubmit}
          handleCloseModal={handleCloseModal}
        />
      )}
    </>
  );
};

export default Schools;