import os

from flask import Flask, redirect, render_template, request, session

# Configure application and assign secret key for session
app = Flask(__name__)
app.secret_key = os.environ.get(
    "SECRET_KEY",
    "dev-secret-key"
)

# default study settings
DEFAULTS = {
    "study": 25,
    "short_break": 5,
    "long_break": 20,
    "pomocount": 4,
    "autobreak": False,
    "autostudy": False
}

@app.route("/", methods=["GET", "POST"])
def start():
    # user filled out form
    if request.method == "POST":
        # read strings from form
        study = request.form.get("study", "").strip()
        short_break = request.form.get("short_break", "").strip()
        long_break = request.form.get("long_break", "").strip()
        pomocount = request.form.get("pomocount", "").strip()
        autobreak = (request.form.get("autobreak") == "on")
        autostudy = (request.form.get("autostudy") == "on")

        # converting strings to int
        try:
            study = int(study)
            short_break = int(short_break)
            long_break = int(long_break)
            pomocount = int(pomocount)
        except ValueError:
            # if invalid number, re-render form with an error
            return render_template("start.html", defaults=DEFAULTS, error="Please enter whole numbers.")
        
        # range checks
        if not (1 <= study <= 180 and 1 <= short_break <= 180 and 1 <= long_break <= 180 and 1 <= pomocount <= 180):
            return render_template("start.html", defaults=DEFAULTS, error="Values out of range (1-180).")
        
        # store values in session
        session["pomo_settings"] = {
            "study": study,
            "short_break": short_break,
            "long_break": long_break,
            "pomocount": pomocount,
            "autobreak": autobreak,
            "autostudy": autostudy
        }

        return redirect("/index")
    
    # GET: show form and pre-fill it with session values if they exist
    else:
        saved = session.get("pomo_settings", DEFAULTS)
        return render_template("start.html", defaults=saved)
    

@app.route("/index")
def index():
    settings = session.get("pomo_settings", DEFAULTS)
    return render_template("index.html", settings=settings)