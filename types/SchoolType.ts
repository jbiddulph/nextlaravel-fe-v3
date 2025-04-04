export interface SchoolType {
    school_id?: number; // Explicitly required and must be a number
    /**
     * The unique identifier for the school, represented as a UUID.
     */
    id?: string; // Ensure this is a UUID if applicable
    uprn?: number;
    establishment_name: string;
    address?: string;
    street?: string;
    locality?: string;
    address3?: string;
    town?: string;
    establishment_type_group?: string;
    phase_of_education?: string;
    featured_image?: string;
    la_name?: string;
    establishment_number?: string;
    establishment_status?: string;
    statutory_low_age?: string;
    statutory_high_age?: string;
    boarders?: string;
    nursery_provision?: string;
    official_sixth_form?: string;
    gender?: string;
    religious_character?: string;
    religious_ethos?: string;
    admissions_policy?: string;
    school_capacity?: string;
    special_classes?: string;
    census_date?: string;
    number_of_pupils?: string;
    number_of_boys?: string;
    number_of_girls?: string;
    percentage_fsm?: string;
    trust_school_flag?: string;
    school_sponsor_flag?: string;
    federation_flag?: string;
    federations?: string;
    ukprn?: string;
    ofsted_last_insp?: string;
    ofsted_special_measures?: string;
    last_changed_date?: string;
    county?: string;
    postcode?: string;
    school_website?: string;
    telephone_number?: string;
    head_title?: string;
    head_first_name?: string;
    head_last_name?: string;
    head_preferred_job_title?: string;
    sen1?: string;
    sen2?: string;
    sen3?: string;
    sen4?: string;
    type_of_resourced_provision?: string;
    resourced_provision_on_roll?: string;
    resourced_provision_capacity?: string;
    sen_unit_on_roll?: string;
    sen_unit_capacity?: string;
    gor?: string;
    district_administrative?: string;
    administrative_ward?: string;
    parliamentary_constituency?: string;
    urban_rural?: string;
    easting?: string;
    northing?: string;
    msoa?: string;
    lsoa?: string;
    ofsted_rating?: string;
    country?: string;
    vote_ratio?: string;
    vote_total?: string;
}