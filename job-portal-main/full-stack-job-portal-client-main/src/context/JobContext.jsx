import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

const jobContext = React.createContext();

const JobContext = ({ children }) => {
    const [jobLoading, setJobLoading] = useState(true);
    const [jobError, setJobError] = useState({ status: false, message: "" });
    const [jobs, setJobs] = useState({});

    const handleJobFetch = async (url) => {
        setJobLoading(true);
        try {
            // withCredentials: true sends cookies if logged in, ignored if not
            const response = await axios.get(url, { withCredentials: true });
            setJobError({ status: false, message: "" });
            setJobs(response?.data);
        } catch (error) {
            setJobError({ status: true, message: error?.message });
            setJobs({ status: false });
            setJobLoading(false);
        }
        setJobLoading(false);
    };

    useEffect(() => {
        handleJobFetch(`http://localhost:8000/api/v1/jobs/all?page=1`);
    }, []);

    const passing = {
        jobLoading,
        jobError,
        jobs,
        setJobs,
        handleJobFetch,
    };

    return (
        <jobContext.Provider value={passing}>{children}</jobContext.Provider>
    );
};

const useJobContext = () => useContext(jobContext);

export { useJobContext, JobContext };
