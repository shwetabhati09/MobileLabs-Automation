'######################################################################################
'Objective: To demonstrate cross platform scripting for nativeautomation

'######################################################################################

'Provide device connection params here
CLIPath = "C:\Users\Naveen\Desktop\dC_CLIMaster"
HubAddress = "10.10.0.33"
UserName = "naveen@mlabs.com"
Pwd = "deviceconnect"
DeviceID = "iPhone_9_3"
applicationname="deviceControl"
orientation="Portrait"
scale="25"

'Connect device
SystemUtil.CloseProcessByName "MobileLabs.deviceViewer.exe"
SystemUtil.CloseProcessByName "MobileLabs.DeviceConnect.Cli.exe"
connectParams = HubAddress & " " & UserName & " " & Pwd _
& " -device " & DeviceID _
& " -release"
SystemUtil.Run "MobileLabs.DeviceConnect.Cli.exe", connectParams,CLIPath	
	
WaitForProcess("MobileLabs.DeviceConnect.Cli.exe")
connectParams = HubAddress & " " & UserName & " " & Pwd _
& " -device " & DeviceID _
& " -scale " & scale _
& " -orientation " & orientation _
& " -nativeautomation " _
& " -run " & applicationname
Reporter.ReportEvent micDone, "ConnectToDevice", "Connect Parameters: " & connectParams		
SystemUtil.Run "MobileLabs.DeviceConnect.Cli.exe", connectParams,CLIPath
WaitForProcess("MobileLabs.DeviceConnect.Cli.exe")

'Close the iTunes signin dialog if it is present
If MobiDevice("iOS").MobiElement("SignIntoiTunesStore").Exist(30) Then
	MobiDevice("iOS").MobiButton("Cancel").Click
End If

'Handle the iOS update dialog
If MobiDevice("iOS").MobiElement("SoftwareUpdate").Exist(10) Then
	If MobiDevice("iOS").MobiButton("Later").Exist(5) Then
		MobiDevice("iOS").MobiButton("Later").Click
	End If
	Wait 2
	If MobiDevice("iOS").MobiButton("RemindMeLater").Exist(5) Then
		MobiDevice("iOS").MobiButton("RemindMeLater").Click
	End If
End If


If MobiDevice("deviceControl").MobiElement("WelcometodeviceControl").Exist(20) Then
	MobiDevice("deviceControl").MobiElement("WelcometodeviceControl").Highlight
	Print "Device connected!"
	MobiDevice("deviceControl").ButtonPress eHOME
Else
	Print "Failed to connect to device!"
End If

'#################################################
'Get device OS
strOS = LCase(MobiDevice("deviceControl").GetROProperty("platform"))

'#################################################
'Install Geico app
Select Case strOS
	Case "iphone os"
		appName = "Geico"
		
	Case "androidos"
		appName = "GEICO Mobile_Obfuscated"
		
	Case Else
		MsgBox "Couldn't get device platform, exiting test!"
		ExitTest
End Select

connectParams = HubAddress & " " & UserName & " " & Pwd _
& " -device " & DeviceID _
& " -nativeautomation " _
& " -install " & appName
Reporter.ReportEvent micDone, "InstallApp", "Connect Parameters: " & connectParams		
SystemUtil.Run "MobileLabs.DeviceConnect.Cli.exe", connectParams,CLIPath
WaitForProcess("MobileLabs.DeviceConnect.Cli.exe")

'#################################################
'Change WiFi
openDeviceSettings
strOS = LCase(MobiDevice("deviceControl").GetROProperty("platform"))
Select Case strOS
	Case "iphone os"
		intAttempts = 0
		Do While Not(MobiDevice("iOS").MobiElement("SettingsTitle").Exist(2))
			MobiButton("accessibilitylabel:=Back","nativebaseclass:=UINavigationBarBackIndicatorView").Click
			Wait 2
			If MobiDevice("iOS").MobiElement("SettingsTitle").Exist(2) Then
				Print "On Settings screen!"
				Exit Do
			End If
			intAttempts = intAttempts + 1
			If intAttempts > 10 Then
				Print "Couldn't get to the Settings screen in 10 attempts!"
				Exit Do
			End If
		Loop
	
		MobiDevice("iOS").MobiElement("WiFi").Click
		Wait 3
		MobiDevice("iOS").MobiElement("MobileLabs").Click
		Wait 3
		If MobiDevice("iOS").MobiButton("WiFi").Exist(3) Then
			MobiDevice("iOS").MobiButton("WiFi").Click
			Wait 2
		End If
		
		MobiDevice("iOS").MobiElement("Other").Click
		Wait 4
		MobiDevice("iOS").MobiButton("Cancel_WiFi").Click
		Wait 3
		MobiDevice("iOS").ButtonPress eHOME
		Wait 3
		
	Case "androidos"
		intTries = 0
		Do While Not(MobiDevice("deviceControl").MobiElement("WiFi").Exist(2))
			MobiDevice("deviceControl").Swipe eUP, eMEDIUM, 30, 60
			Wait 2
			intTries = intTries + 1
			If intTries > 5 Then
				Exit Do
			End If
		Loop
		
		If MobiDevice("deviceControl").MobiElement("WiFi").Exist(1) Then
			MobiDevice("deviceControl").MobiElement("WiFi").Click
			Wait 3
		Else
			Print "Can't find WiFi in Settings, something went wrong, exiting test. Please check the device!"
			ExitTest
		End If
		
		MobiDevice("deviceControl").MobiElement("MobileLabs").Click
		Wait 2
		
		If MobiDevice("deviceControl").MobiCheckbox("Showpassword").Exist(3) Then
			MobiDevice("deviceControl").MobiEdit("Password").Set "Pyramid@892!"
			Wait 1
		End If
		
		MobiDevice("deviceControl").MobiButton("CONNECT").Click
		MobiDevice("deviceControl").MobiElement("ObtainingIPaddress").WaitProperty "width",0,10000
		MobiDevice("deviceControl").MobiElement("dCMacmini2").Click
		Wait 2
		
		If MobiDevice("deviceControl").MobiCheckbox("Showpassword").Exist(3) Then
			MobiDevice("deviceControl").MobiEdit("Password").Set "123456789"
			Wait 1
		End If
		
		MobiDevice("deviceControl").MobiButton("CONNECT").Click
		MobiDevice("deviceControl").MobiElement("Connected").WaitProperty "width",micGreaterThan(0),10000
		Wait 2
		MobiDevice("deviceControl").ButtonPress eBACK
		Wait 2
		
	Case Else
		MsgBox "Couldn't get device platform, exiting test!"
		ExitTest
End Select




'#################################################
'Force stop Geico app if it is running - Android only
If strOS = "androidos" Then
	openDeviceSettings
	
	intTries = 0
	Do While Not(MobiDevice("deviceControl").MobiElement("Apps").Exist(2))
		MobiDevice("deviceControl").Swipe eDOWN, eMEDIUM, 30, 60
		Wait 3
		intTries = intTries + 1
		If intTries > 5 Then
			Exit Do
		End If
	Loop
	
	If MobiDevice("deviceControl").MobiElement("Apps").Exist(1) Then
		MobiDevice("deviceControl").MobiElement("Apps").Click
	Else
		Print "Can't find Apps in Settings, something went wrong, exiting test. Please check the device!"
		ExitTest
	End If
	
	Wait 3
	MobiDevice("deviceControl").Type "geico"
	Wait 3
	MobiDevice("deviceControl").MobiList("AppList").MobiElement("GEICOMobile").Click
	
	If MobiDevice("deviceControl").MobiButton("FORCESTOP").GetROProperty("enabled") = True Then	
		MobiDevice("deviceControl").MobiButton("FORCESTOP").Click
		Wait 2
		MobiDevice("deviceControl").MobiButton("OK").Click
	End If
	
	If MobiDevice("deviceControl").MobiButton("FORCESTOP").GetROProperty("enabled") = False Then	
		Print "Geico app stopped successfully!"
	End If
	
	MobiDevice("deviceControl").ButtonPress eHOME
	Wait 3 @@ hightlight id_;_2_;_script infofile_;_ZIP::ssf3.xml_;_
End If

'#################################################
'Launch App and browse through some screens
Select Case strOS
	Case "iphone os"
		'Open the search screen by swiping down on home screen
		MobiDevice("deviceControl").ButtonPress eHOME
		Wait 3
		MobiDevice("deviceControl").Draw "down(50%,30%) move(50%,60%,duration=2s) up()"
		Wait 3
		If MobiDevice("iOS").MobiEdit("Search").Exist(5) Then
			MobiDevice("iOS").MobiEdit("Search").Set "G4"
			Wait 2
			MobiDevice("iOS").MobiElement("G475776").Click
		Else
			Print "Search screen not opened, exiting Test!"
			ExitTest
		End If
		
		If  MobiDevice("iOS").MobiElement("Notificationsmayincludealertss").Exist(10) Then
			MobiDevice("iOS").MobiButton("OK").Click
			Wait 2
		End If
		
		
	Case "androidos"
		MobiDevice("deviceControl").MobiElement("AppsIcon").Click
		Wait 3
		MobiDevice("deviceControl").MobiElement("GEICOMobile").Click
		
		If MobiDevice("deviceControl").MobiButton("NOCOMMENT").Exist(5) Then
			MobiDevice("deviceControl").MobiButton("NOCOMMENT").Click
		End If
End Select



strCase = ""
If MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").Exist(10) Then
	strCase = "case1"
ElseIf MobiDevice("GEICO Mobile").MobiImage("GeicoTitle").Exist(5) Then
	strCase = "case2"
ElseIf MobiDevice("GEICO Mobile").MobiImage("GeicoTitle_iOS").Exist(5) Then
	strCase = "case2"
End If

'Select Case LCase(MobiDevice("deviceControl").GetROProperty("devicetype"))
Select Case strCase

'	Case "nexus 6"
	Case "case1"
		If MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").Exist(5) Then
			Print "Geico app launched successfully!"
			
			'Enter UserId and password
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").Set "TestingText!@#$$3223"
			Wait 2
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Password").Set "Test123!@#"
			
			'Show password
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiSwitch("ShowPassword").Set eACTIVATE
			
			If Not(MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("AccidentAssistance").Exist(2)) Then
				Print "Closing Keypad!"
				MobiDevice("GEICO Mobile").ButtonPress eBACK
				Wait 3
			End If

			MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("AccidentAssistance").Click
			If MobiDevice("GEICO Mobile").MobiElement("AccidentAssistanceScreen").Exist Then
				MobiDevice("GEICO Mobile").MobiElement("AccidentAssistanceScreen").Highlight
				Print "Accident assistance screen loaded successfully!"
				Wait 2
			End If
			
			'Go back to login screen
			MobiDevice("GEICO Mobile").ButtonPress eBACK
			Wait 2
			
			'Go to Signup screen
			MobiDevice("GEICO Mobile").MobiButton("SIGNUPFORANACCOUNT").Click
			Wait 2
			
			If MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("RequestError").Exist(3) Then
				MobiDevice("deviceControl").MobiButton("OK").Click
			End If
			
			'Enter data into Activate Account form
			'Enter policy number
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("PolicyNum").Set "007007"
			
			'Select each month one by one and enter day and year
			selectMonth
			
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Day").Set "11"
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Year").Set "2011"
			
			'Close app by pressing Home button
			MobiDevice("GEICO Mobile").ButtonPress eHOME
			Print "Closing app by pressing HOME!"
			Wait 1
		Else
			Print "Geico app did not launch!"
			Reporter.ReportEvent micFail, "App launch", "Geico app did not launch!"
		End If
'	Case "nexus 5x"
	Case "case2"
		Select Case strOS
			Case "iphone os"
				Set objImage = MobiDevice("GEICO Mobile").MobiImage("GeicoTitle_iOS")
				
				If MobiDevice("GEICO Mobile").MobiElement("Howwasyourexperience").Exist(10) Then
					MobiDevice("GEICO Mobile").MobiButton("Nocomment").Click
					Wait 2	
				End If
				
			Case "androidos"
				Set objImage = MobiDevice("GEICO Mobile").MobiImage("GeicoTitle")
		End Select
		
		objImage.WaitProperty "width",micGreaterThan(0),10000
		
		If objImage.Exist(5) Then
			objImage.Highlight
			MobiDevice("GEICO Mobile").MobiButton("GETAQUOTE").Click
			Wait 5
			MobiDevice("GEICO Mobile").MobiElement("AutoInsurance").Click
			Wait 5
			
			Select Case strOS
				Case "iphone os"
					Set objCarIcon = MobiDevice("GEICO Mobile").MobiImage("CarIcon_iOS")
				Case "androidos"
					Set objCarIcon = MobiDevice("GEICO Mobile").MobiElement("Element").MobiImage("CarIcon")
			End Select
			
			If objCarIcon.Exist(5) Then
				objCarIcon.Highlight
				Print "Auto insurance screen loaded successfully!"
				
				'Go back to the Home screen
				goToHomeScreen
			End If
			
			'Go to Signup screen
			MobiDevice("GEICO Mobile").MobiButton("SIGNUPFORANACCOUNT").Click
			
			Select Case strOS
			Case "iphone os"
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("PolicyNum").Set "007007"
				Wait 2
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("DOB_iOS").Click
				Wait 2
				MobiDevice("GEICO Mobile").MobiDatetimePicker("DatetimePicker").Select "1980-01-22"
				Wait 2
				MobiDevice("GEICO Mobile").MobiButton("Done").Click
				Wait 2
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Zip_iOS").Set "30091"
				
			Case "androidos"
				If MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("RequestError").Exist(3) Then
					MobiDevice("deviceControl").MobiButton("OK").Click
				End If
				
				'Enter data into Activate Account form
				'Enter policy number
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("PolicyNum").Set "007007"
				
				'Select each month one by one and enter day and year
				selectMonth
				
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Day").Set "11"
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Year").Set "2011"
				Wait 2
				
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("ZipCode").Set "30091"
			End Select
			
			
			'Close app by pressing Home button
			MobiDevice("GEICO Mobile").ButtonPress eHOME
			Print "Closing app by pressing HOME!"
			Wait 1
		Else
			Print "Geico app did not launch!"
			Reporter.ReportEvent micFail, "App launch", "Geico app did not launch!"
		End If
		
	Case Else
		Print MobiDevice("deviceControl").GetROProperty("devicetype")
	
End Select

'Go to Home
MobiDevice("deviceControl").ButtonPress eHOME

Select Case strOS
	Case "iphone os"
		Set objHomeElement = MobiDevice("deviceControl").MobiElement("iOSSettingsIcon")
	Case "androidos"
		Set objHomeElement = MobiDevice("deviceControl").MobiElement("SayOkGoogle")
End Select

If objHomeElement.Exist(5) Then
	Print "Home screen displayed!"
	objHomeElement.Highlight
End If

'Destroy all objects
Set objImage = Nothing
Set objCarIcon = Nothing
Set objHomeElement = Nothing

'#################################################Functions#################################################

Function WaitForProcess(strProcessName)
	'Wait for the process to complete
	Set objWMI = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
	
	Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = '" & strProcessName & "'")
	intWait = 0

	Do While colItems.Count > 0
		Set colItems = Nothing
		Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = '" & strProcessName & "'")
		wait 3
		intWait = intWait + 5
		If intWait = 150 Then
			Exit Do
		End If
	Loop
		
	Set objWMI = Nothing
	Set colItems = Nothing
End Function


'#################################################

Sub selectMonth
	arrMonths = Array("January","December","February","November","March","October","April","September","May","August","June","July")

	For i = 0 To UBound(arrMonths)
		MobiDevice("GEICO Mobile").MobiElement("Element").MobiDropdown("Month").Click
		Wait 2
		
		strMonthToSelect = arrMonths(i)
		intMonthToSelect = Month(DateValue("22-" & strMonthToSelect & "-2000"))
		
		MobiDevice("GEICO Mobile").MobiElement("TopMonth").Highlight
		strTopMonth = MobiDevice("GEICO Mobile").MobiElement("TopMonth").GetROProperty("text")
		intTopMonth = Month(DateValue("22-" & strTopMonth & "-2000"))
		
		MobiDevice("GEICO Mobile").MobiElement("BottomMonth").Highlight
		strBottomMonth = MobiDevice("GEICO Mobile").MobiElement("BottomMonth").GetROProperty("text")
		intBottomMonth = Month(DateValue("22-" & strBottomMonth & "-2000"))
		
		If intMonthToSelect <= intBottomMonth AND intMonthToSelect >= intTopMonth Then
			MobiDevice("GEICO Mobile").MobiList("Months").Select strMonthToSelect
			Wait 1
		ElseIf intMonthToSelect < intTopMonth Then
			MobiDevice("GEICO Mobile").MobiList("Months").Swipe eUP, eMEDIUM, 20, 80
			Wait 2
			MobiDevice("GEICO Mobile").MobiList("Months").Select strMonthToSelect
		ElseIf intMonthToSelect > intBottomMonth Then
			MobiDevice("GEICO Mobile").MobiList("Months").Swipe eDOWN, eMEDIUM, 20, 80
			Wait 2
			MobiDevice("GEICO Mobile").MobiList("Months").Select strMonthToSelect
		End If
		Wait 2
		strSelectedMonth = MobiDevice("GEICO Mobile").MobiElement("Element").MobiDropdown("Month").MobiElement("MonthValue").GetROProperty("text")
		Print "Passed in month was <" & strMonthToSelect & "> and selected month is <" & strSelectedMonth & ">"
	Next
End Sub

'#################################################

Sub openDeviceSettings
	strPlatform = LCase(MobiDevice("deviceControl").GetROProperty("platform"))

	Select Case strPlatform
		Case "iphone os"
'			Set objSettingsIcon = MobiElement("accessibilitylabel:=Settings","nativebaseclass:=UIView")
			Set objSettingsIcon = MobiDevice("deviceControl").MobiElement("iOSSettingsIcon")

			blnFound = False
			If Not(objSettingsIcon.Exist(5)) Then
				MobiDevice("deviceControl").ButtonPress eHOME
				Wait 5
			End If
			intX = objSettingsIcon.GetROProperty("x")
			Wait 2
			intDeviceWidth = CInt(MobiDevice("deviceControl").GetROProperty("width") - 50)
			If intX > 0 AND intX < intDeviceWidth Then
				blnFound = True
			Else
				MobiDevice("deviceControl").ButtonPress eHOME
				Wait 10
				intX = objSettingsIcon.GetROProperty("x")
				Wait 5
				intDeviceWidth = CInt(MobiDevice("deviceControl").GetROProperty("width") - 50)
				
				If intX > 0 AND intX < intDeviceWidth Then
					blnFound = True
				Else
					Do While intX > intDeviceWidth
						MobiDevice("deviceControl").Draw "down(80%,50%) move(20%,50%,duration=2s) up()"
						Wait 3
						intX = objSettingsIcon.GetROProperty("x")
						Wait 2
						intDeviceWidth = CInt(MobiDevice("deviceControl").GetROProperty("width") - 50)
						
						If intX < intDeviceWidth Then
							blnFound = True
							Exit Do
						End If
					Loop
				End If
			End If
			
			If blnFound Then
				objSettingsIcon.Click
			Else
				MsgBox "Settings not found, please check the device screen!"
			End If
			
		Case "androidos"
			MobiDevice("deviceControl").ButtonPress eHOME
			Wait 3
			MobiDevice("deviceControl").MobiElement("SayOkGoogle").Click
			Wait 4
			MobiDevice("deviceControl").Type "settings"
			Wait 5
			MobiDevice("deviceControl").MobiElement("Settings").Click
			Wait 2
		Case Else
			MsgBox "Couldn't get device platform, exiting test!"
			ExitTest
	End Select

	Set objSettingsIcon = Nothing
End Sub

'#################################################
Sub goToHomeScreen
	strPlatform = LCase(MobiDevice("deviceControl").GetROProperty("platform"))
	
	Select Case strPlatform
		Case "iphone os"
			Set objBack = MobiDevice("GEICO Mobile").MobiButton("Back_iOS")
		Case "androidos"
			Set objBack = MobiDevice("GEICO Mobile").MobiImage("BackButton")
	End Select
	
	intTries = 0	
	Do While objBack.Exist(2)
		objBack.Click
		Wait 2
		intTries = intTries + 1
		If intTries > 10 Then
			Print "Home screen not loaded after clicking the Back image 10 times!"
			Exit Do
		End If
	Loop
	
	Set objBack = Nothing
End Sub

'#################################################



MobiDevice("CarMax QA").MobiEdit("FirstName").Set "Tester"
Wait 2
MobiDevice("CarMax QA").MobiEdit("LastName").Set "CarMax"
Wait 2
MobiDevice("CarMax QA").MobiEdit("ZipCode").Set "30901"
Wait 2
MobiDevice("CarMax QA").MobiEdit("Email").Set "test@dc.com"
Wait 2
MobiDevice("CarMax QA").MobiEdit("Password").Set "testing123#$"
Wait 2
MobiDevice("CarMax QA").MobiCheckbox("ShowPassword").Set eCHECKED
Wait 2
MobiDevice("CarMax QA").MobiCheckbox("ShowPassword").Set eUNCHECKED
Wait 2

MobiDevice("CarMax QA").MobiButton("MakeModel").Click
Wait 3
MobiDevice("CarMax QA").MobiDropdown("FindStoreByState").Select "Georgia"
Wait 3
MobiDevice("CarMax QA").MobiList("List").MobiElement("Norcross").Click
Wait 3
MobiDevice("CarMax QA").MobiElement("Audi").Click
Wait 5
MobiDevice("CarMax QA").MobiElement("Q5").Click
Wait 5
MobiDevice("CarMax QA").MobiElement("_30998").Click
Wait 5
MobiDevice("CarMax QA").MobiElement("_1of18").Click
Wait 4
MobiDevice("CarMax QA").MobiImage("CloseX").Click
Wait 4
MobiDevice("CarMax QA").MobiImage("Back").Click
Wait 4
MobiDevice("CarMax QA").MobiImage("Menu").Click
Wait 4
MobiDevice("CarMax QA").MobiList("List").MobiElement("Calculators").Click
Wait 4
MobiDevice("CarMax QA").MobiElement("Financing").Click
Wait 4
MobiDevice("CarMax QA").MobiWebView("WebView").Highlight




MobiDevice("CarMax QA").MobiEdit("FirstName").Set "Tester12"
Wait 2
MobiDevice("CarMax QA").MobiEdit("LastName").Set "CarMax67()"



'#################################################



